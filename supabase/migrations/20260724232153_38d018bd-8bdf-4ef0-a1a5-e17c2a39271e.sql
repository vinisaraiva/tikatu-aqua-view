CREATE POLICY "Admins can update app_config"
ON public.app_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, UPDATE ON public.app_config TO authenticated;