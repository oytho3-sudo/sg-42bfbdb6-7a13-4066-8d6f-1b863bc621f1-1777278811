-- Neue Spalte für individuelle Freigaben hinzufügen
ALTER TABLE documents 
ADD COLUMN shared_with_users uuid[] DEFAULT '{}';

-- Index für Performance
CREATE INDEX idx_documents_shared_with_users ON documents USING gin(shared_with_users);

-- Die alte "view_shared_documents" Policy löschen (Techniker sehen nur noch eigene)
DROP POLICY IF EXISTS view_shared_documents ON documents;

-- Neue Policy: Techniker sehen nur ihre eigenen Dokumente
-- (select_own_documents existiert bereits, also ist das abgedeckt)

-- Neue Policy: User sehen Dokumente, die explizit für sie freigegeben wurden
CREATE POLICY "view_individually_shared_documents" ON documents
  FOR SELECT
  USING (auth.uid() = ANY(shared_with_users));

COMMENT ON COLUMN documents.shared_with_users IS 'Array von User-IDs, die Zugriff auf dieses Dokument haben';