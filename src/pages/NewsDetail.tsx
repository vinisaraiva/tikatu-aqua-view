
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CalendarIcon, TagIcon, UserIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NewsDetail = () => {
  const { id } = useParams();

  // Mock news data - in a real app this would come from an API
  const newsData: Record<string, any> = {
    '1': {
      id: 1,
      title: 'Novo sistema de monitoramento instalado no Rio Tietê',
      content: `
        <p>Um novo sistema de monitoramento da qualidade da água foi instalado no Rio Tietê, representando um marco importante para o controle ambiental da região metropolitana de São Paulo.</p>
        
        <p>O sistema utiliza sensores de última geração capazes de medir em tempo real diversos parâmetros físico-químicos da água, incluindo pH, oxigênio dissolvido, turbidez, temperatura e presença de poluentes específicos.</p>
        
        <h3>Características do novo sistema:</h3>
        <ul>
          <li>Monitoramento 24/7 com transmissão de dados em tempo real</li>
          <li>Alertas automáticos para situações de emergência</li>
          <li>Precisão 30% superior aos sistemas anteriores</li>
          <li>Integração com plataformas de análise de dados</li>
        </ul>
        
        <p>Esta tecnologia permitirá às autoridades ambientais responder mais rapidamente a incidents de poluição e monitorar a eficácia das medidas de recuperação do rio.</p>
        
        <p>O projeto faz parte de uma iniciativa maior de revitalização dos corpos d'água da região, com investimento total de R$ 50 milhões distribuídos ao longo de três anos.</p>
      `,
      date: '2024-05-25',
      category: 'Tecnologia',
      author: 'Dr. Marina Silva',
      readTime: '3 min',
    },
    '2': {
      id: 2,
      title: 'Índices de qualidade da água mostram melhoria em São Paulo',
      content: `
        <p>O relatório mensal da Secretaria do Meio Ambiente indica uma melhoria significativa nos índices de qualidade da água em importantes corpos d'água da região metropolitana de São Paulo.</p>
        
        <p>Os dados coletados durante o mês de abril mostram uma redução de 15% nos níveis de poluentes orgânicos e uma melhoria de 20% nos índices de oxigenação dos rios monitorados.</p>
        
        <h3>Principais melhorias identificadas:</h3>
        <ul>
          <li>Redução de coliformes fecais em 18%</li>
          <li>Aumento do oxigênio dissolvido</li>
          <li>Diminuição da turbidez da água</li>
          <li>Melhoria no pH dos corpos d'água</li>
        </ul>
        
        <p>Segundo especialistas, essas melhorias são resultado direto das políticas de saneamento implementadas nos últimos dois anos e do maior rigor na fiscalização de despejos industriais.</p>
      `,
      date: '2024-05-22',
      category: 'Meio Ambiente',
      author: 'João Santos',
      readTime: '4 min',
    },
  };

  const article = newsData[id || '1'];

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Notícia não encontrada</h1>
              <Link to="/">
                <Button>Voltar ao início</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'bg-blue-100 text-blue-800',
      'Meio Ambiente': 'bg-green-100 text-green-800',
      'Pesquisa': 'bg-purple-100 text-purple-800',
      'Educação': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
        </div>

        <article>
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">{article.readTime} de leitura</span>
              </div>
              
              <CardTitle className="text-3xl leading-tight text-gray-900">
                {article.title}
              </CardTitle>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(article.date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {article.author}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TagIcon className="h-16 w-16 text-teal-600/50" />
                </div>
              </div>
              
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
