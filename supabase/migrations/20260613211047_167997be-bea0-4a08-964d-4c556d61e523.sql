CREATE TABLE public.site_access_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  password_hash text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  last_access_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_access_codes_hash ON public.site_access_codes (password_hash);

-- Grants: admins (limitados por RLS) e service role (edge function)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_access_codes TO authenticated;
GRANT ALL ON public.site_access_codes TO service_role;

ALTER TABLE public.site_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site access codes"
ON public.site_access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Trigger para manter updated_at
CREATE TRIGGER update_site_access_codes_updated_at
BEFORE UPDATE ON public.site_access_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();