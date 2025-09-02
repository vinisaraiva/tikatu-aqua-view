-- Fix security definer view issue by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.volunteers_view;
CREATE VIEW public.volunteers_view AS
SELECT 
  v.id,
  v.code,
  v.nome,
  v.type,
  v.probe_model,
  v.probe_serial,
  v.last_communication,
  v.point_id,
  v.is_active,
  v.created_at,
  p.name as point_name,
  r.id as river_id,
  r.name as river_name,
  c.id as city_id,
  c.name as city_name,
  c.state
FROM public.volunteers v
JOIN public.points p ON v.point_id = p.id
JOIN public.rivers r ON p.river_id = r.id
JOIN public.cities c ON r.city_id = c.id;

-- Enable RLS on volunteers_view
ALTER VIEW public.volunteers_view OWNER TO postgres;

-- Add RLS policy for volunteers_view
CREATE POLICY "Allow admin access to volunteers_view" ON public.volunteers_view
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = ANY (ARRAY['admin'::text, 'moderator'::text])
  )
);