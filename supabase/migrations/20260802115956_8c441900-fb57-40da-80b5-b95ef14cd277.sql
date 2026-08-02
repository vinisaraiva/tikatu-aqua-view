-- 1. Agenda de coleta por ponto
CREATE TABLE public.volunteer_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id bigint NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  point_id integer NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
  weekdays smallint[] NOT NULL DEFAULT '{}',
  scheduled_time time NOT NULL DEFAULT '08:00',
  tolerance_minutes integer NOT NULL DEFAULT 60,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (volunteer_id, point_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_schedules TO authenticated;
GRANT ALL ON public.volunteer_schedules TO service_role;

ALTER TABLE public.volunteer_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage volunteer schedules"
ON public.volunteer_schedules FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_volunteer_schedules_updated_at
BEFORE UPDATE ON public.volunteer_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Dispositivos de push dos voluntários
CREATE TABLE public.volunteer_push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id bigint NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  last_success_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.volunteer_push_subscriptions TO authenticated;
GRANT ALL ON public.volunteer_push_subscriptions TO service_role;

ALTER TABLE public.volunteer_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view push subscriptions"
ON public.volunteer_push_subscriptions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_volunteer_push_subscriptions_updated_at
BEFORE UPDATE ON public.volunteer_push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Log de lembretes enviados
CREATE TABLE public.volunteer_reminder_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid NOT NULL REFERENCES public.volunteer_schedules(id) ON DELETE CASCADE,
  volunteer_id bigint NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  point_id integer NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  kind text NOT NULL DEFAULT 'due',
  sent_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, reminder_date, kind)
);

GRANT SELECT ON public.volunteer_reminder_log TO authenticated;
GRANT ALL ON public.volunteer_reminder_log TO service_role;

ALTER TABLE public.volunteer_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reminder log"
ON public.volunteer_reminder_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Atualizar volunteers_view com a agenda
DROP VIEW IF EXISTS public.volunteers_view;

CREATE VIEW public.volunteers_view
WITH (security_invoker = true) AS
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
  primary_vp.point_id,
  p.name as point_name,
  r.id as river_id,
  r.name as river_name,
  c.id as city_id,
  c.name as city_name,
  c.state,
  (
    SELECT json_agg(
      json_build_object(
        'point_id', vp2.point_id,
        'point_name', p2.name,
        'river_name', r2.name,
        'city_name', c2.name,
        'is_primary', vp2.is_primary,
        'weekdays', COALESCE(vs.weekdays, '{}'::smallint[]),
        'scheduled_time', vs.scheduled_time,
        'tolerance_minutes', COALESCE(vs.tolerance_minutes, 60)
      ) ORDER BY vp2.is_primary DESC, p2.name
    )
    FROM volunteer_points vp2
    JOIN points p2 ON vp2.point_id = p2.id
    JOIN rivers r2 ON p2.river_id = r2.id
    JOIN cities c2 ON r2.city_id = c2.id
    LEFT JOIN volunteer_schedules vs ON vs.volunteer_id = vp2.volunteer_id AND vs.point_id = vp2.point_id
    WHERE vp2.volunteer_id = v.id
  ) as points
FROM volunteers v
LEFT JOIN volunteer_points primary_vp ON v.id = primary_vp.volunteer_id AND primary_vp.is_primary = true
LEFT JOIN points p ON primary_vp.point_id = p.id
LEFT JOIN rivers r ON p.river_id = r.id
LEFT JOIN cities c ON r.city_id = c.id;

REVOKE ALL ON public.volunteers_view FROM anon;
GRANT SELECT ON public.volunteers_view TO authenticated;