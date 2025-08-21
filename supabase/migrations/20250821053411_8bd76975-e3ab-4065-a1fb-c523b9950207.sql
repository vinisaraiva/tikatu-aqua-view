-- Update volunteers_view to include nome field
DROP VIEW IF EXISTS public.volunteers_view;

CREATE VIEW public.volunteers_view AS
SELECT 
    v.id,
    v.code,
    v.nome,
    v.is_active,
    v.created_at,
    v.point_id,
    p.name as point_name,
    p.river_id,
    r.name as river_name,
    r.city_id,
    c.name as city_name,
    c.state
FROM volunteers v
LEFT JOIN points p ON v.point_id = p.id
LEFT JOIN rivers r ON p.river_id = r.id
LEFT JOIN cities c ON r.city_id = c.id;