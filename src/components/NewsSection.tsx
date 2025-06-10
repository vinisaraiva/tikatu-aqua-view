
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
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-teal-600 text-sm font-medium mb-2">Read Our Latest</p>
              <h2 className="text-4xl font-bold text-gray-900">
                News & Articles
              </h2>
            </div>
            <Link to="/news">
              <Button variant="outline" className="bg-green-600 text-white border-green-600 hover:bg-green-700">
                VIEW MORE NEWS
              </Button>
            </Link>
          </div>
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Featured Article - Left Side */}
            {news[0] && (
              <Link to={`/news/${news[0].id}`} className="group">
                <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full">
                  <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-blue-100 relative overflow-hidden">
                    {news[0].image_url ? (
                      <img 
                        src={news[0].image_url} 
                        alt={news[0].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white text-sm mb-3">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(news[0].created_at).toLocaleDateString('pt-BR')}
                        <span className="mx-2">•</span>
                        <span>{news[0].read_time}</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold leading-tight group-hover:text-teal-200 transition-colors">
                        {news[0].title}
                      </h3>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                </Card>
              </Link>
            )}

            {/* Secondary Articles - Right Side */}
            <div className="space-y-6">
              {news.slice(1, 4).map((article) => (
                <Link key={article.id} to={`/news/${article.id}`} className="group">
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex gap-4 p-4">
                      <div className="aspect-square w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight mb-2">
                          {article.title}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {article.summary}
                        </p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-teal-600 hover:text-teal-700 mt-2">
                          READ MORE
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
