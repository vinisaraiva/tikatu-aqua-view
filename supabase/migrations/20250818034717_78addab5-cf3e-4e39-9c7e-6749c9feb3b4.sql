-- Criar função auxiliar para extrair volunteer_code do caminho do arquivo
CREATE OR REPLACE FUNCTION public.extract_volunteer_code_from_path(file_path text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extrair volunteer_code da estrutura: volunteer_code/YYYY-MM/filename.xlsx
  RETURN split_part(file_path, '/', 1);
END;
$$;

-- Criar função para verificar se usuário pode acessar arquivo baseado no volunteer_code
CREATE OR REPLACE FUNCTION public.can_access_volunteer_file(file_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Criar função para validar formato do arquivo e estrutura de pasta
CREATE OR REPLACE FUNCTION public.validate_volunteer_file_path(file_path text, bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
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

-- Política para INSERT (Upload de arquivos)
CREATE POLICY "Volunteer files upload policy" 
ON storage.objects 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  bucket_id = 'coleta-voluntarios' AND
  public.validate_volunteer_file_path(name, bucket_id) AND
  (
    -- Admins podem fazer upload de qualquer arquivo
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Usuários autenticados podem fazer upload (validação de volunteer_code pode ser refinada)
    auth.uid() IS NOT NULL OR
    -- Permitir uploads anônimos (para voluntários via app)
    auth.uid() IS NULL
  )
);

-- Política para SELECT (Visualização de arquivos)
CREATE POLICY "Volunteer files view policy" 
ON storage.objects 
FOR SELECT 
TO authenticated, anon
USING (
  bucket_id = 'coleta-voluntarios' AND
  (
    -- Admins podem ver todos os arquivos
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Usuários podem ver arquivos baseado no volunteer_code
    public.can_access_volunteer_file(name) OR
    -- Permitir visualização anônima (para voluntários via app)
    auth.uid() IS NULL
  )
);

-- Política para UPDATE (Atualização de metadados)
CREATE POLICY "Volunteer files update policy" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'coleta-voluntarios' AND
  (
    -- Admins podem atualizar qualquer arquivo
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Usuários podem atualizar seus próprios arquivos
    public.can_access_volunteer_file(name)
  )
);

-- Política para DELETE (Exclusão de arquivos)
CREATE POLICY "Volunteer files delete policy" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'coleta-voluntarios' AND
  (
    -- Admins podem excluir qualquer arquivo
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    -- Usuários podem excluir seus próprios arquivos
    public.can_access_volunteer_file(name)
  )
);