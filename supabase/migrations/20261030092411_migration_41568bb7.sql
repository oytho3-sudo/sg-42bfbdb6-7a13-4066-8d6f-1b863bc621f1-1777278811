-- Die alte storage_update_files Policy löschen
DROP POLICY IF EXISTS "storage_update_files" ON storage.objects;

-- Überprüfen der verbleibenden Policies
SELECT 
  policyname as "Policy Name",
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd::text
  END as "Aktion"
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'storage_%'
ORDER BY cmd, policyname;