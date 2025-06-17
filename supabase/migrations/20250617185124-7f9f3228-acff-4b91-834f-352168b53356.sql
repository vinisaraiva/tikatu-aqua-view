
-- Adicionar coluna state na tabela cities
ALTER TABLE public.cities ADD COLUMN state TEXT;

-- Atualizar a cidade existente Porto Seguro com estado BA
UPDATE public.cities 
SET state = 'BA' 
WHERE name = 'PORTO SEGURO';

-- Inserir a nova cidade Santarém com estado PA
INSERT INTO public.cities (name, state) 
VALUES ('SANTARÉM', 'PA');

-- Atualizar o rio Jua para a cidade de Santarém
UPDATE public.rivers 
SET city_id = (SELECT id FROM public.cities WHERE name = 'SANTARÉM')
WHERE name = 'JUA';
