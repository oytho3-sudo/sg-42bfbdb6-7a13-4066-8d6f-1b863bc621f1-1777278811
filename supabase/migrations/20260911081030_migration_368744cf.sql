-- Alte Policy entfernen
DROP POLICY IF EXISTS "users_can_read_own_documents" ON storage.objects;

-- Neue Policy erstellen: Benutzer können eigene Dateien UND freigegebene Dateien lesen
CREATE POLICY "users_can_read_documents" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND (
    -- Eigene Dateien im eigenen Ordner
    ((storage.foldername(name))[1] = (auth.uid())::text)
    OR
    -- Dateien, die in der documents-Tabelle für den Benutzer freigegeben sind
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.file_path = storage.objects.name
      AND (
        documents.shared_with_all = true
        OR auth.uid() = ANY(documents.shared_with_users)
      )
    )
  )
);