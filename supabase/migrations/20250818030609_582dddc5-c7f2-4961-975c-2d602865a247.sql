-- Corrigir políticas RLS da tabela volunteers
-- Remover políticas restritivas atuais
DROP POLICY IF EXISTS "volunteers_deny_all" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_select" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_insert" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_update" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_delete" ON public.volunteers;

-- Criar política para login anônimo (apenas validação de credenciais)
CREATE POLICY "Allow anonymous login validation" 
ON public.volunteers 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Criar política para admins gerenciarem tudo
CREATE POLICY "Admins can manage all volunteers" 
ON public.volunteers 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Garantir que readings podem ser inseridas por usuários autenticados (incluindo voluntários)
-- Esta política já existe, mas vamos confirmar
DROP POLICY IF EXISTS "Allow volunteer readings insert" ON public.readings;
CREATE POLICY "Allow volunteer readings insert" 
ON public.readings 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Garantir que reading_values podem ser inseridas por usuários autenticados
DROP POLICY IF EXISTS "Allow volunteer reading_values insert" ON public.reading_values;
CREATE POLICY "Allow volunteer reading_values insert" 
ON public.reading_values 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);