-- UPDATE Policy für Storage Objects hinzufügen
-- Erlaubt authenticated users, ihre eigenen Dateien im documents Bucket zu aktualisieren
CREATE POLICY "users_can_update_own_documents"
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