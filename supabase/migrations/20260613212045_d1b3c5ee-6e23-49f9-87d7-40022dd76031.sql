UPDATE auth.users
SET encrypted_password = crypt('tikatu2025', gen_salt('bf')),
    updated_at = now(),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'vinicius_saraiva@ifba.edu.br';