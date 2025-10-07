-- FASE 1: Criar Enum e Estrutura de Roles (se não existir)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Criar tabela user_roles se não existir
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- FASE 2: Criar Função has_role (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- FASE 3: Políticas RLS para user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- FASE 4: Migrar Dados Existentes
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role 
FROM public.profiles 
WHERE role IN ('admin', 'moderator', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- FASE 5: Criar/Atualizar Usuário Admin Temporário
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@tikatu.temp';
  
  IF admin_user_id IS NULL THEN
    -- Criar novo usuário no auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@tikatu.temp',
      crypt('#tikatu', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Temporário"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_user_id;

    RAISE NOTICE 'Novo admin criado com email: admin@tikatu.temp';
  ELSE
    RAISE NOTICE 'Admin já existe com email: admin@tikatu.temp';
  END IF;

  -- Criar ou atualizar perfil (usando INSERT ... ON CONFLICT)
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (admin_user_id, 'Admin Temporário', 'admin')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin';

  -- Garantir que tem o role de admin na nova tabela
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Credenciais: admin@tikatu.temp / #tikatu';
END $$;

-- FASE 6: Atualizar Políticas RLS - app_settings
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - cities
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
CREATE POLICY "Admins can manage cities"
ON public.cities
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - rivers
DROP POLICY IF EXISTS "Admins can manage rivers" ON public.rivers;
CREATE POLICY "Admins can manage rivers"
ON public.rivers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - points
DROP POLICY IF EXISTS "Admins can manage points" ON public.points;
CREATE POLICY "Admins can manage points"
ON public.points
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - parameters
DROP POLICY IF EXISTS "Admins can manage parameters" ON public.parameters;
CREATE POLICY "Admins can manage parameters"
ON public.parameters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - news
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news"
ON public.news
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - readings
DROP POLICY IF EXISTS "Admins can manage readings" ON public.readings;
CREATE POLICY "Admins can manage readings"
ON public.readings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - reading_values
DROP POLICY IF EXISTS "Admins can manage reading_values" ON public.reading_values;
CREATE POLICY "Admins can manage reading_values"
ON public.reading_values
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FASE 6: Atualizar Políticas RLS - volunteers
DROP POLICY IF EXISTS "Admins can manage all volunteers" ON public.volunteers;
CREATE POLICY "Admins can manage all volunteers"
ON public.volunteers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));