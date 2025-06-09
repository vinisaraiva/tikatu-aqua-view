
-- Criar tabela para as notícias
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  read_time TEXT NOT NULL DEFAULT '3 min',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhorar performance
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_published ON public.news(is_published);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública das notícias publicadas
CREATE POLICY "Anyone can read published news" 
  ON public.news 
  FOR SELECT 
  USING (is_published = true);

-- Criar política para permitir que usuários autenticados vejam todas as notícias
CREATE POLICY "Authenticated users can read all news" 
  ON public.news 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Inserir algumas notícias de exemplo
INSERT INTO public.news (title, summary, content, category, author, read_time) VALUES
(
  'Novo sistema de monitoramento instalado no Rio Tietê',
  'Tecnologia avançada permite acompanhamento em tempo real da qualidade da água com maior precisão.',
  '<p>Um novo sistema de monitoramento da qualidade da água foi instalado no Rio Tietê, representando um marco importante para o controle ambiental da região metropolitana de São Paulo.</p><p>O sistema utiliza sensores de última geração capazes de medir em tempo real diversos parâmetros físico-químicos da água, incluindo pH, oxigênio dissolvido, turbidez, temperatura e presença de poluentes específicos.</p><h3>Características do novo sistema:</h3><ul><li>Monitoramento 24/7 com transmissão de dados em tempo real</li><li>Alertas automáticos para situações de emergência</li><li>Precisão 30% superior aos sistemas anteriores</li><li>Integração com plataformas de análise de dados</li></ul><p>Esta tecnologia permitirá às autoridades ambientais responder mais rapidamente a incidents de poluição e monitorar a eficácia das medidas de recuperação do rio.</p>',
  'Tecnologia',
  'Dr. Marina Silva',
  '3 min'
),
(
  'Índices de qualidade da água mostram melhoria em São Paulo',
  'Relatório mensal indica redução de poluentes em importantes corpos d''água da região metropolitana.',
  '<p>O relatório mensal da Secretaria do Meio Ambiente indica uma melhoria significativa nos índices de qualidade da água em importantes corpos d''água da região metropolitana de São Paulo.</p><p>Os dados coletados durante o mês de abril mostram uma redução de 15% nos níveis de poluentes orgânicos e uma melhoria de 20% nos índices de oxigenação dos rios monitorados.</p><h3>Principais melhorias identificadas:</h3><ul><li>Redução de coliformes fecais em 18%</li><li>Aumento do oxigênio dissolvido</li><li>Diminuição da turbidez da água</li><li>Melhoria no pH dos corpos d''água</li></ul><p>Segundo especialistas, essas melhorias são resultado direto das políticas de saneamento implementadas nos últimos dois anos e do maior rigor na fiscalização de despejos industriais.</p>',
  'Meio Ambiente',
  'João Santos',
  '4 min'
),
(
  'Parceria com universidades amplia pesquisa aquática',
  'Convênio com instituições de ensino fortalece estudos sobre preservação dos recursos hídricos.',
  '<p>Foi firmado um importante convênio entre o sistema de monitoramento ambiental e principais universidades públicas do estado para ampliar as pesquisas relacionadas à qualidade da água.</p><p>A parceria envolve a Universidade de São Paulo (USP), Universidade Estadual de Campinas (Unicamp) e Universidade Estadual Paulista (Unesp), criando uma rede colaborativa de pesquisa.</p><h3>Benefícios da parceria:</h3><ul><li>Acesso a laboratórios especializados</li><li>Participação de estudantes de pós-graduação</li><li>Desenvolvimento de novas metodologias</li><li>Publicação de estudos científicos</li></ul><p>O convênio tem duração de cinco anos e prevê investimento de R$ 2 milhões em equipamentos e bolsas de estudo.</p>',
  'Pesquisa',
  'Prof. Ana Costa',
  '5 min'
),
(
  'Workshop sobre análise de dados ambientais',
  'Evento capacita profissionais em técnicas avançadas de interpretação de dados de monitoramento.',
  '<p>Será realizado nos dias 15 e 16 de junho o workshop "Análise Avançada de Dados Ambientais", destinado a capacitar profissionais da área ambiental em técnicas modernas de interpretação de dados.</p><p>O evento é voltado para técnicos, pesquisadores e gestores públicos que trabalham com monitoramento da qualidade da água.</p><h3>Programação do workshop:</h3><ul><li>Estatística aplicada ao monitoramento ambiental</li><li>Uso de machine learning na detecção de anomalias</li><li>Visualização de dados temporais</li><li>Cases práticos de análise</li></ul><p>As inscrições estão abertas e podem ser feitas através do site oficial. O evento é gratuito e oferece certificado de participação.</p>',
  'Educação',
  'Dr. Carlos Mendes',
  '2 min'
);
