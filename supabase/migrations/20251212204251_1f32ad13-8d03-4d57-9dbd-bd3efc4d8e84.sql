-- Atualizar a view volunteers_view para não depender de point_id
DROP VIEW IF EXISTS public.volunteers_view;

CREATE VIEW public.volunteers_view AS
SELECT 
  v.id,
  v.code,
  v.nome,
  v.type,
  v.is_active,
  v.api_key,
  v.probe_model,
  v.probe_serial,
  v.last_communication,
  v.created_at,
  -- Ponto principal (para compatibilidade de exibição)
  primary_vp.point_id,
  p.name as point_name,
  r.id as river_id,
  r.name as river_name,
  c.id as city_id,
  c.name as city_name,
  c.state,
  -- Array de todos os pontos do voluntário
  (
    SELECT json_agg(
      json_build_object(
        'point_id', vp2.point_id,
        'point_name', p2.name,
        'river_name', r2.name,
        'city_name', c2.name,
        'is_primary', vp2.is_primary
      ) ORDER BY vp2.is_primary DESC, p2.name
    )
    FROM volunteer_points vp2
    JOIN points p2 ON vp2.point_id = p2.id
    JOIN rivers r2 ON p2.river_id = r2.id
    JOIN cities c2 ON r2.city_id = c2.id
    WHERE vp2.volunteer_id = v.id
  ) as points
FROM volunteers v
LEFT JOIN volunteer_points primary_vp ON v.id = primary_vp.volunteer_id AND primary_vp.is_primary = true
LEFT JOIN points p ON primary_vp.point_id = p.id
LEFT JOIN rivers r ON p.river_id = r.id
LEFT JOIN cities c ON r.city_id = c.id;

-- Remover a coluna point_id da tabela volunteers
ALTER TABLE public.volunteers DROP CONSTRAINT IF EXISTS volunteers_point_id_fkey;
ALTER TABLE public.volunteers DROP COLUMN IF EXISTS point_id;