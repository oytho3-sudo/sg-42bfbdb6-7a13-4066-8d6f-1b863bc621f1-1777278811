-- Tabelle für Dokumenten-Metadaten erstellen
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
  description text
);

-- RLS aktivieren
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies: Benutzer können nur ihre eigenen Dokumente sehen und verwalten
CREATE POLICY "select_own_documents" ON documents 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_documents" ON documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_documents" ON documents 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_documents" ON documents 
  FOR DELETE USING (auth.uid() = user_id);

-- Index für bessere Performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);