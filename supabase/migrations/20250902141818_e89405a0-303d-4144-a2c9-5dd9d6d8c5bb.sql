-- Extend volunteers table for probe support
ALTER TABLE public.volunteers 
ADD COLUMN type text NOT NULL DEFAULT 'manual' CHECK (type IN ('manual', 'probe')),
ADD COLUMN api_key text UNIQUE,
ADD COLUMN probe_model text,
ADD COLUMN probe_serial text,
ADD COLUMN last_communication timestamp with time zone;

-- Add collection_type to readings table
ALTER TABLE public.readings 
ADD COLUMN collection_type text NOT NULL DEFAULT 'manual' CHECK (collection_type IN ('manual', 'automatic')),
ADD COLUMN volunteer_id bigint REFERENCES public.volunteers(id);

-- Create index for API key lookups
CREATE INDEX idx_volunteers_api_key ON public.volunteers(api_key) WHERE api_key IS NOT NULL;

-- Update volunteers_view to include new fields
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