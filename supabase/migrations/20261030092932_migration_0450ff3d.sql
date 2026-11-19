-- Alle Storage Policies aufräumen und neu erstellen

-- Alte/Duplikat Policies löschen
DROP POLICY IF EXISTS "users_can_delete_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_can_upload_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_can_read_documents" ON storage.objects;
DROP POLICY IF EXISTS "users_can_update_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own_files" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_shared_files" ON storage.objects;

-- ========================================
-- INSERT Policies
-- ========================================

-- User kann in eigenen Ordner hochladen
CREATE POLICY "storage_insert_own_folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- User kann in fremde Ordner hochladen wenn Dokument geteilt ist (upsert-Fall)
CREATE POLICY "storage_insert_shared_upsert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND user_can_access_storage_file(name, auth.uid())
);

-- ========================================
-- DELETE Policies
-- ========================================

-- User kann eigene Dateien löschen
CREATE POLICY "storage_delete_own_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins können alle Dateien löschen
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

-- Techniker können geteilte Dateien löschen
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
  AND user_can_access_storage_file(name, auth.uid())
);