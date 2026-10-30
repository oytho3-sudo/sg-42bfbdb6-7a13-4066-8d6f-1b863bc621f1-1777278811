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

-- Alle Policies anzeigen
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