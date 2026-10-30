-- Alle Storage Policies neu erstellen mit der SECURITY DEFINER Funktion

-- Zuerst die UPDATE Policies löschen und neu erstellen
DROP POLICY IF EXISTS "storage_update_own_files" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_shared_files" ON storage.objects;

-- UPDATE: Eigene Dateien
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

-- UPDATE: Geteilte Dateien (nutzt SECURITY DEFINER Funktion)
CREATE POLICY "storage_update_shared_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.user_can_access_storage_file(name, auth.uid())
)
WITH CHECK (
  bucket_id = 'documents'
  AND public.user_can_access_storage_file(name, auth.uid())
);

-- SELECT Policy auch aktualisieren
DROP POLICY IF EXISTS "storage_select_own_and_shared" ON storage.objects;

CREATE POLICY "storage_select_own_and_shared"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    public.user_can_access_storage_file(name, auth.uid())
  )
);