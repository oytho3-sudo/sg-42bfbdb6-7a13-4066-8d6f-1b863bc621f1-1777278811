-- SECURITY DEFINER Funktion erstellen, die prüft ob ein User Zugriff auf eine Storage-Datei hat
-- Diese Funktion kann RLS umgehen und wird von Storage-Policies aufgerufen

CREATE OR REPLACE FUNCTION public.user_can_access_storage_file(
  file_path text,
  user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfen ob das Dokument existiert und der User Zugriff hat
  RETURN EXISTS (
    SELECT 1 
    FROM public.documents 
    WHERE documents.file_path = user_can_access_storage_file.file_path
      AND (
        -- User ist der Besitzer
        documents.user_id = user_can_access_storage_file.user_id
        OR
        -- Dokument ist mit diesem User geteilt
        user_can_access_storage_file.user_id = ANY(documents.shared_with_users)
        OR
        -- Dokument ist mit allen geteilt UND User ist Admin
        (
          documents.shared_with_all = true 
          AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = user_can_access_storage_file.user_id 
            AND profiles.role = 'Admin'
          )
        )
      )
  );
END;
$$;

-- Storage-Policies mit der neuen Funktion aktualisieren
DROP POLICY IF EXISTS "storage_update_own_files" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_shared_files" ON storage.objects;

-- UPDATE Policy: Kombiniert eigene und geteilte Dateien in einer Policy
CREATE POLICY "storage_update_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    -- Eigene Dateien (im eigenen Ordner)
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Geteilte Dateien (via documents-Tabelle)
    public.user_can_access_storage_file(name, auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    public.user_can_access_storage_file(name, auth.uid())
  )
);