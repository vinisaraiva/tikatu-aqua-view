-- Funções sensíveis NÃO devem ser executáveis por visitantes nem por usuários comuns.
-- (continuam executáveis pelo service_role / contexto interno)
REVOKE ALL ON FUNCTION public.register_admin_user(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_admins() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_volunteer_file_path(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.extract_volunteer_code_from_path(text) FROM PUBLIC, anon, authenticated;

-- has_role e can_access_volunteer_file são usadas dentro das policies de RLS,
-- portanto precisam permanecer executáveis pelos papéis que consultam o banco.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_volunteer_file(text) TO anon, authenticated;