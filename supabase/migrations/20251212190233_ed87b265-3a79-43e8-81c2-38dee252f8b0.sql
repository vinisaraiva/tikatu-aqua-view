-- Criar tabela de relacionamento N:N entre voluntários e pontos
CREATE TABLE public.volunteer_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id bigint NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    point_id integer NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(volunteer_id, point_id)
);

-- Índices para performance
CREATE INDEX idx_volunteer_points_volunteer_id ON public.volunteer_points(volunteer_id);
CREATE INDEX idx_volunteer_points_point_id ON public.volunteer_points(point_id);

-- Habilitar RLS
ALTER TABLE public.volunteer_points ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage volunteer_points"
ON public.volunteer_points
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read access for volunteer_points"
ON public.volunteer_points
FOR SELECT
USING (true);

-- Migrar dados existentes do point_id para a nova tabela
INSERT INTO public.volunteer_points (volunteer_id, point_id, is_primary)
SELECT id, point_id, true
FROM public.volunteers
WHERE point_id IS NOT NULL;

-- Atualizar a view volunteers_view para incluir múltiplos pontos
DROP VIEW IF EXISTS public.volunteers_view;

CREATE VIEW public.volunteers_view AS
SELECT 
    v.id,
    v.code,
    v.nome,
    v.type,
    v.is_active,
    v.probe_model,
    v.probe_serial,
    v.last_communication,
    v.created_at,
    -- Ponto primário (para compatibilidade)
    vp_primary.point_id,
    p_primary.name as point_name,
    r_primary.id as river_id,
    r_primary.name as river_name,
    c_primary.id as city_id,
    c_primary.name as city_name,
    c_primary.state,
    -- Array com todos os pontos do voluntário
    COALESCE(
        (SELECT json_agg(json_build_object(
            'point_id', vp.point_id,
            'point_name', p.name,
            'river_name', r.name,
            'city_name', c.name,
            'is_primary', vp.is_primary
        ) ORDER BY vp.is_primary DESC, p.name)
        FROM public.volunteer_points vp
        JOIN public.points p ON p.id = vp.point_id
        JOIN public.rivers r ON r.id = p.river_id
        JOIN public.cities c ON c.id = r.city_id
        WHERE vp.volunteer_id = v.id),
        '[]'::json
    ) as points
FROM public.volunteers v
LEFT JOIN public.volunteer_points vp_primary ON vp_primary.volunteer_id = v.id AND vp_primary.is_primary = true
LEFT JOIN public.points p_primary ON p_primary.id = vp_primary.point_id
LEFT JOIN public.rivers r_primary ON r_primary.id = p_primary.river_id
LEFT JOIN public.cities c_primary ON c_primary.id = r_primary.city_id
ORDER BY v.code;