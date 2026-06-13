-- Recria a view respeitando o RLS de quem consulta (security_invoker),
-- de modo que apenas administradores (conforme a policy da tabela volunteers) vejam os dados.
ALTER VIEW public.volunteers_view SET (security_invoker = true);

-- Remove o acesso de visitantes anônimos; admins autenticados continuam acessando via RLS.
REVOKE ALL ON public.volunteers_view FROM anon;
GRANT SELECT ON public.volunteers_view TO authenticated;