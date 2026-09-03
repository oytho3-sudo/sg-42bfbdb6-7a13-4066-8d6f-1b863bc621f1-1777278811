-- Alle überlappenden SELECT Policies entfernen
DROP POLICY IF EXISTS "select_own_documents" ON documents;
DROP POLICY IF EXISTS "admin_view_all_documents" ON documents;
DROP POLICY IF EXISTS "users_can_view_shared_documents" ON documents;
DROP POLICY IF EXISTS "view_individually_shared_documents" ON documents;

-- Eine neue, klare Policy erstellen
CREATE POLICY "view_documents" ON documents
FOR SELECT
USING (
  auth.uid() = user_id  -- Eigene Dokumente
  OR
  auth.uid() = ANY(shared_with_users)  -- Individuell freigegebene
  OR
  (
    shared_with_all = true  -- Veröffentlichte für Admins
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  )
);