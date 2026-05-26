-- Admin-Freigabe-System: Spalte für geteilte Dokumente hinzufügen
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS shared_with_all boolean DEFAULT false;

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_documents_shared ON documents(shared_with_all) WHERE shared_with_all = true;

-- Admin kann alle Dokumente sehen (für Freigabe-Verwaltung)
CREATE POLICY "admin_view_all_documents" ON documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'Admin'
  )
);

-- Admin kann Dokumente freigeben/zurückziehen
CREATE POLICY "admin_update_sharing" ON documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'Admin'
  )
);

-- Nutzer können freigegebene Dokumente sehen
CREATE POLICY "view_shared_documents" ON documents
FOR SELECT
TO authenticated
USING (
  shared_with_all = true
  OR auth.uid() = user_id
);