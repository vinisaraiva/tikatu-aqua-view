-- Correção do usuário admin existente (Opção 1)

-- Passo 1: Corrigir o role de "adm" para "admin" (CRÍTICO para segurança)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '3e70d4d2-ee73-43b6-b556-de8449afb5cd';

-- Passo 2: Atualizar informações do usuário na tabela auth.users
UPDATE auth.users 
SET 
  email = 'vinicius_saraiva@ifba.edu.br',
  raw_user_meta_data = jsonb_build_object('full_name', 'Vinicius Saraiva')
WHERE id = '3e70d4d2-ee73-43b6-b556-de8449afb5cd';

-- Passo 3: Atualizar nome no perfil
UPDATE public.profiles 
SET full_name = 'Vinicius Saraiva'
WHERE id = '3e70d4d2-ee73-43b6-b556-de8449afb5cd';

-- Passo 4: Atualizar senha
UPDATE auth.users 
SET encrypted_password = crypt('#saraiva', gen_salt('bf'))
WHERE id = '3e70d4d2-ee73-43b6-b556-de8449afb5cd';