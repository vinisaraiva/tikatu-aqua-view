-- Create app_settings table for system configurations
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value boolean NOT NULL DEFAULT true,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings
CREATE POLICY "Admins can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Public can read app settings (for menu visibility)
CREATE POLICY "Public can read app settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Insert default setting for education menu
INSERT INTO public.app_settings (key, value, description) 
VALUES ('show_education_menu', true, 'Controla se o link da área educacional aparece no menu principal');

-- Create trigger for automatic updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();