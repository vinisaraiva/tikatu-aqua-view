-- Tabela de registros de acessos (analytics próprio, dados anônimos)
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  duration_seconds integer NOT NULL DEFAULT 0,
  device_type text,
  os text,
  browser text,
  country text,
  region text,
  city text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para consultas do painel
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at);
CREATE INDEX idx_page_views_session_id ON public.page_views (session_id);
CREATE INDEX idx_page_views_path ON public.page_views (path);

-- Grants: inserção apenas via edge function (service role); leitura por usuários autenticados (restrita por RLS a admins)
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem ler os dados de acessos
CREATE POLICY "Admins can read page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));