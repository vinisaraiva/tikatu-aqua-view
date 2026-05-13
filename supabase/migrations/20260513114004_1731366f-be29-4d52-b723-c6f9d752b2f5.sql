
DROP POLICY IF EXISTS "Allow anonymous login validation" ON public.volunteers;
DROP POLICY IF EXISTS "Allow all operations on coleta-voluntarios bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous insert for reading values" ON public.reading_values;
DROP POLICY IF EXISTS "Allow volunteer reading_values insert" ON public.reading_values;
DROP POLICY IF EXISTS "Authenticated users can insert reading values" ON public.reading_values;
DROP POLICY IF EXISTS "Allow anonymous insert for readings" ON public.readings;
DROP POLICY IF EXISTS "Allow volunteer readings insert" ON public.readings;
DROP POLICY IF EXISTS "Authenticated users can insert readings" ON public.readings;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.can_access_volunteer_file(file_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN true;
  END IF;
  RETURN auth.uid() IS NOT NULL;
END;
$function$;
