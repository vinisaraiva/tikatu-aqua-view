-- Fix Security Definer View issue
-- Drop the existing view that has SECURITY DEFINER
DROP VIEW IF EXISTS public.volunteers_view;

-- Recreate the view without SECURITY DEFINER (defaults to SECURITY INVOKER)
CREATE VIEW public.volunteers_view AS
SELECT 
    v.id,
    v.is_active,
    v.created_at,
    v.point_id,
    p.river_id,
    r.city_id,
    c.name as city_name,
    r.name as river_name,
    c.state,
    p.name as point_name,
    v.code
FROM public.volunteers v
JOIN public.points p ON v.point_id = p.id
JOIN public.rivers r ON p.river_id = r.id
JOIN public.cities c ON r.city_id = c.id;

-- Grant appropriate permissions
GRANT SELECT ON public.volunteers_view TO authenticated;
GRANT SELECT ON public.volunteers_view TO anon;