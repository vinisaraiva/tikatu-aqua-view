
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewspaperIcon, ArrowRightIcon, CalendarIcon, LoaderIcon, AlertCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '@/hooks/useNews';

const NewsSection = () => {
  const { data: news = [], isLoading, error } = useNews();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'bg-blue-100 text-blue-800',
      'Meio Ambiente': 'bg-green-100 text-green-800',
      'Pesquisa': 'bg-purple-100 text-purple-800',
      'Educação': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Erro ao carregar notícias
            </h2>
            <p className="text-gray-600">
              Não foi possível carregar as notícias. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </section>
    );
  }

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-gray-600">Carregando notícias...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <NewspaperIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma notícia disponível
            </h3>
            <p className="text-gray-600">
              Não há notícias publicadas no momento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {news.slice(0, 4).map((article) => (
                <Link key={article.id} to={`/news/${article.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-t-lg relative overflow-hidden">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(article.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-teal-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {article.summary}
                      </p>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-teal-600 hover:text-teal-700 self-start">
                        Leia mais
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link to="/news">
                <Button variant="outline" size="lg">
                  Ver todas as notícias
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
