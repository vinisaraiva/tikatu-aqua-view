
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewspaperIcon, ArrowRightIcon, CalendarIcon } from 'lucide-react';

const NewsSection = () => {
  const news = [
    {
      id: 1,
      title: 'Novo sistema de monitoramento instalado no Rio Tietê',
      summary: 'Tecnologia avançada permite acompanhamento em tempo real da qualidade da água com maior precisão.',
      date: '2024-05-25',
      category: 'Tecnologia',
      imageUrl: '/api/placeholder/300/200',
    },
    {
      id: 2,
      title: 'Índices de qualidade da água mostram melhoria em São Paulo',
      summary: 'Relatório mensal indica redução de poluentes em importantes corpos d\'água da região metropolitana.',
      date: '2024-05-22',
      category: 'Meio Ambiente',
      imageUrl: '/api/placeholder/300/200',
    },
    {
      id: 3,
      title: 'Parceria com universidades amplia pesquisa aquática',
      summary: 'Convênio com instituições de ensino fortalece estudos sobre preservação dos recursos hídricos.',
      date: '2024-05-20',
      category: 'Pesquisa',
      imageUrl: '/api/placeholder/300/200',
    },
    {
      id: 4,
      title: 'Workshop sobre análise de dados ambientais',
      summary: 'Evento capacita profissionais em técnicas avançadas de interpretação de dados de monitoramento.',
      date: '2024-05-18',
      category: 'Educação',
      imageUrl: '/api/placeholder/300/200',
    },
  ];

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
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <NewspaperIcon className="h-8 w-8 text-teal-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Portal de Notícias
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acompanhe as últimas novidades sobre monitoramento ambiental, 
            pesquisas científicas e avanços tecnológicos na área
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {news.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(article.date).toLocaleDateString('pt-BR')}
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-teal-600 transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.summary}
                </p>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-teal-600 hover:text-teal-700">
                  Leia mais
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            Ver todas as notícias
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
