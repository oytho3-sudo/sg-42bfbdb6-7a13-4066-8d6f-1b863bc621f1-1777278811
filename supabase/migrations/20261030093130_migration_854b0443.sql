-- INSERT Policy für geteilte Dokumente hinzufügen
-- Erlaubt INSERT wenn die Datei in documents-Tabelle existiert und geteilt ist
CREATE POLICY "storage_insert_shared_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND user_can_access_storage_file(name, auth.uid())
);