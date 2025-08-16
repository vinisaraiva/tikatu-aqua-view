-- Função para cadastrar administradores manualmente
CREATE OR REPLACE FUNCTION register_admin_user(
  admin_email text,
  admin_password text,
  admin_full_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Script de exemplo para cadastrar o primeiro admin
-- DESCOMENTE E EXECUTE com seus dados:
/*
SELECT register_admin_user(
  'seu-email@exemplo.com',
  'sua-senha-segura',
  'Seu Nome Completo'
);
*/

-- Função auxiliar para listar admins cadastrados
CREATE OR REPLACE FUNCTION list_admins()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
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