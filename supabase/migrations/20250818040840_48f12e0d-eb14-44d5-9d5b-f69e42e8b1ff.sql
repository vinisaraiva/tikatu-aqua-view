-- Remover políticas RLS existentes complexas do storage
DROP POLICY IF EXISTS "Volunteers can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Volunteers can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Volunteers can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Volunteers can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can access all volunteer files" ON storage.objects;

-- Criar política simples para permitir todas as operações no bucket coleta-voluntarios
-- Esta política funcionará com service_role key
CREATE POLICY "Allow all operations on coleta-voluntarios bucket"
ON storage.objects
FOR ALL
USING (bucket_id = 'coleta-voluntarios');

-- Manter a função de validação para uso futuro se necessário
-- Mas as políticas RLS não vão usá-la mais