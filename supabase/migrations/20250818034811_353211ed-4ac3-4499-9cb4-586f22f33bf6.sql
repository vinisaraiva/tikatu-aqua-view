-- Corrigir funções com search_path mutable
-- Atualizar função extract_volunteer_code_from_path
CREATE OR REPLACE FUNCTION public.extract_volunteer_code_from_path(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extrair volunteer_code da estrutura: volunteer_code/YYYY-MM/filename.xlsx
  RETURN split_part(file_path, '/', 1);
END;
$$;

-- Atualizar função validate_volunteer_file_path
CREATE OR REPLACE FUNCTION public.validate_volunteer_file_path(file_path text, bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  path_parts text[];
  volunteer_code text;
  year_month text;
  filename text;
BEGIN
  -- Verificar se é o bucket correto
  IF bucket_name != 'coleta-voluntarios' THEN
    RETURN false;
  END IF;
  
  -- Dividir o caminho em partes
  path_parts := string_to_array(file_path, '/');
  
  -- Verificar se tem exatamente 3 partes: volunteer_code/YYYY-MM/filename.xlsx
  IF array_length(path_parts, 1) != 3 THEN
    RETURN false;
  END IF;
  
  volunteer_code := path_parts[1];
  year_month := path_parts[2];
  filename := path_parts[3];
  
  -- Validar volunteer_code (não vazio)
  IF volunteer_code IS NULL OR volunteer_code = '' THEN
    RETURN false;
  END IF;
  
  -- Validar formato year_month (YYYY-MM)
  IF year_month !~ '^\d{4}-\d{2}$' THEN
    RETURN false;
  END IF;
  
  -- Validar formato filename (YYYYMMDD_HHMMSS_coleta.xlsx)
  IF filename !~ '^\d{8}_\d{6}_coleta\.xlsx$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Atualizar função can_access_volunteer_file
CREATE OR REPLACE FUNCTION public.can_access_volunteer_file(file_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  volunteer_code_from_path text;
  user_volunteer_code text;
  user_role text;
BEGIN
  -- Extrair volunteer_code do caminho do arquivo
  volunteer_code_from_path := public.extract_volunteer_code_from_path(file_path);
  
  -- Se usuário é admin, pode acessar qualquer arquivo
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Para outros usuários, verificar se o volunteer_code corresponde
  -- Por enquanto, permitir acesso se estiver autenticado (pode ser refinado depois)
  RETURN auth.uid() IS NOT NULL;
END;
$$;

-- Atualizar função handle_new_user com search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$;

-- Atualizar função register_admin_user com search_path
CREATE OR REPLACE FUNCTION public.register_admin_user(admin_email text, admin_password text, admin_full_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  encrypted_password text;
BEGIN
  -- Gerar ID único para o usuário
  user_id := gen_random_uuid();
  
  -- Criptografar a senha (usando crypt do pgcrypto)
  encrypted_password := crypt(admin_password, gen_salt('bf'));
  
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    admin_email,
    encrypted_password,
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', admin_full_name),
    false,
    '',
    '',
    ''
  );
  
  -- Inserir perfil na tabela profiles
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (user_id, admin_full_name, 'admin');
  
  RETURN user_id;
END;
$$;

-- Atualizar função list_admins com search_path
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(id uuid, email text, full_name text, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.email,
    p.full_name,
    u.created_at
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE p.role = 'admin'
  ORDER BY u.created_at;
$$;

-- Atualizar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;