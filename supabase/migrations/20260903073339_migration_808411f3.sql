-- Alte Policy löschen und neue erstellen
DROP POLICY IF EXISTS "users_can_view_shared_documents" ON documents;

CREATE POLICY "users_can_view_shared_documents" ON documents
FOR SELECT
USING (
  auth.uid() = user_id  -- Eigene Dokumente
  OR 
  auth.uid() = ANY(shared_with_users)  -- Individuell freigegeben
  OR
  (
    shared_with_all = true  -- Veröffentlichte Dokumente
    AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  )
);