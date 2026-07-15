
-- Tighten volunteer file access: only admins via RLS (probe uploads go through edge functions with service role)
CREATE OR REPLACE FUNCTION public.can_access_volunteer_file(file_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin'::public.app_role);
END;
$$;

-- Recreate storage policies without anon bypass
DROP POLICY IF EXISTS "Volunteer files upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Volunteer files view policy" ON storage.objects;
DROP POLICY IF EXISTS "Volunteer files update policy" ON storage.objects;
DROP POLICY IF EXISTS "Volunteer files delete policy" ON storage.objects;

CREATE POLICY "Volunteer files upload policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coleta-voluntarios'
  AND public.validate_volunteer_file_path(name, bucket_id)
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Volunteer files view policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'coleta-voluntarios'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Volunteer files update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'coleta-voluntarios'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Volunteer files delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'coleta-voluntarios'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Restrict volunteer_points read to authenticated users
DROP POLICY IF EXISTS "Public read access for volunteer_points" ON public.volunteer_points;

CREATE POLICY "Authenticated users can read volunteer_points"
ON public.volunteer_points FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.volunteer_points FROM anon;
