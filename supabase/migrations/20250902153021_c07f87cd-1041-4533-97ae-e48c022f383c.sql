-- Alterar coluna password_hash para aceitar valores NULL
-- Isso permite que sondas sejam criadas sem senha (usam API key)
ALTER TABLE public.volunteers 
ALTER COLUMN password_hash DROP NOT NULL;