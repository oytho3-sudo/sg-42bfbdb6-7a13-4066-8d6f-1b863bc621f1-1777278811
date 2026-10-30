-- Migration: Storage Policies für geteilte Dokumente
-- Datum: 2026-10-30
-- Zweck: Erlaubt das Überschreiben von geteilten Dokumenten im Storage

-- Zuerst alle existierenden Policies löschen (sauberer Neustart)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own and shared files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update shared files" ON storage.objects;

-- ========================================
-- INSERT Policy: User kann in eigenen Ordner hochladen
-- ========================================
CREATE POLICY "storage_insert_own_folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- UPDATE Policy: User kann eigene Dateien aktualisieren
-- ========================================
CREATE POLICY "storage_update_own_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- UPDATE Policy: User kann geteilte Dateien aktualisieren
-- Prüft ob das entsprechende Dokument in documents-Tabelle geteilt wurde
-- ========================================
CREATE POLICY "storage_update_shared_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.file_path = storage.objects.name
      AND (
        -- Dokument ist mit diesem User geteilt
        auth.uid() = ANY(documents.shared_with_users)
        OR
        -- Dokument ist mit allen geteilt UND User ist Admin
        (
          documents.shared_with_all = true 
          AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin'
          )
        )
      )
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.file_path = storage.objects.name
      AND (
        auth.uid() = ANY(documents.shared_with_users)
        OR
        (
          documents.shared_with_all = true 
          AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin'
          )
        )
      )
  )
);

-- ========================================
-- DELETE Policy: User kann eigene Dateien löschen
-- ========================================
CREATE POLICY "storage_delete_own_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- DELETE Policy: Admins können alle Dateien löschen
-- ========================================
CREATE POLICY "storage_delete_admin_all"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'Admin'
  )
);

-- ========================================
-- DELETE Policy: Techniker können geteilte Dateien löschen
-- ========================================
CREATE POLICY "storage_delete_shared_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'Techniker'
  )
  AND EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.file_path = storage.objects.name
      AND (
        auth.uid() = ANY(documents.shared_with_users)
        OR documents.shared_with_all = true
      )
  )
);

-- ========================================
-- SELECT Policy: User kann eigene und geteilte Dateien lesen
-- ========================================
CREATE POLICY "storage_select_own_and_shared"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- Eigene Dateien
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Geteilte Dateien
    EXISTS (
      SELECT 1 
      FROM public.documents 
      WHERE documents.file_path = storage.objects.name
        AND (
          auth.uid() = ANY(documents.shared_with_users)
          OR
          (
            documents.shared_with_all = true 
            AND EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'Admin'
            )
          )
        )
    )
  )
);

-- Erfolgreiche Migration loggen
DO $$
BEGIN
  RAISE NOTICE 'Storage Policies für geteilte Dokumente erfolgreich erstellt';
END $$;