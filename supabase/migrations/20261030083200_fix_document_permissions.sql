-- Migration: Fix document permissions for shared documents and admin delete
-- Datum: 2026-10-30
-- Problem 1: Geteilte Dokumente können nicht überschrieben werden
-- Problem 2: Admins/Techniker können Dokumente nicht löschen

-- ============================================
-- TEIL 1: UPDATE-Berechtigung für geteilte Dokumente
-- ============================================

-- Policy für Updates auf Dokumente, die mit dem User geteilt wurden
CREATE POLICY "update_shared_documents"
ON documents FOR UPDATE
TO authenticated
USING (
  -- User ist in shared_with_users array enthalten
  auth.uid() = ANY(shared_with_users)
  OR
  -- Dokument ist für alle geteilt UND User ist Admin
  (shared_with_all = true AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  ))
)
WITH CHECK (
  -- User ist in shared_with_users array enthalten
  auth.uid() = ANY(shared_with_users)
  OR
  -- Dokument ist für alle geteilt UND User ist Admin
  (shared_with_all = true AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  ))
);

-- ============================================
-- TEIL 2: DELETE-Berechtigung für Admins/Techniker
-- ============================================

-- Policy für Admins: Können alle Dokumente löschen
CREATE POLICY "admin_delete_all_documents"
ON documents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Admin'
  )
);

-- Policy für Techniker: Können geteilte Dokumente löschen
CREATE POLICY "techniker_delete_shared_documents"
ON documents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'Techniker'
  )
  AND (
    -- Dokument wurde mit dem Techniker geteilt
    auth.uid() = ANY(shared_with_users)
    OR
    -- Oder es ist allgemein geteilt (für alle)
    shared_with_all = true
  )
);

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Storage Policies für documents bucket
-- Hinweis: Storage verwendet ein anderes Policy-System als Postgres RLS

-- Policy für Updates (Überschreiben) von geteilten Dateien
DO $$
BEGIN
  -- Prüfen ob Policy existiert, sonst erstellen
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'documents' 
    AND name = 'Allow updates on shared documents'
  ) THEN
    -- Diese Policy erlaubt Updates auf Dateien, die geteilt wurden
    INSERT INTO storage.policies (bucket_id, name, definition)
    VALUES (
      'documents',
      'Allow updates on shared documents',
      'bucket_id = ''documents'' AND (storage.foldername(name))[1] = auth.uid()::text OR EXISTS (SELECT 1 FROM documents WHERE file_path = name AND (auth.uid() = ANY(shared_with_users) OR (shared_with_all = true AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''Admin''))))'
    );
  END IF;
END $$;

-- Policy für Admin DELETE auf Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE bucket_id = 'documents' 
    AND name = 'Allow admin delete all'
  ) THEN
    INSERT INTO storage.policies (bucket_id, name, definition)
    VALUES (
      'documents',
      'Allow admin delete all',
      'bucket_id = ''documents'' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''Admin'')'
    );
  END IF;
END $$;

-- Policies anzeigen zur Überprüfung
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lesen'
    WHEN cmd = 'INSERT' THEN 'Erstellen'
    WHEN cmd = 'UPDATE' THEN 'Aktualisieren'
    WHEN cmd = 'DELETE' THEN 'Löschen'
    ELSE cmd
  END as "Aktion"
FROM pg_policies
WHERE tablename = 'documents'
ORDER BY cmd, policyname;