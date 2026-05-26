-- Supabase Storage Bucket für Dokumente erstellen
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Benutzer können eigene Dateien hochladen
CREATE POLICY "users_can_upload_own_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Benutzer können eigene Dateien lesen
CREATE POLICY "users_can_read_own_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Benutzer können eigene Dateien löschen
CREATE POLICY "users_can_delete_own_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);