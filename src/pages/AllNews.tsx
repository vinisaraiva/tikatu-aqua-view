
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewspaperIcon, ArrowLeftIcon, CalendarIcon, LoaderIcon, AlertCircleIcon, ClockIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNews } from '@/hooks/useNews';

const AllNews = () => {
  const { data: news = [], isLoading, error } = useNews();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'bg-blue-100 text-blue-800 border-blue-200',
      'Meio Ambiente': 'bg-green-100 text-green-800 border-green-200',
      'Pesquisa': 'bg-purple-100 text-purple-800 border-purple-200',
      'Educação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Erro ao carregar notícias
            </h1>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar as notícias. Tente novamente mais tarde.
            </p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <NewspaperIcon className="h-10 w-10 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Portal de Notícias
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todas as notícias sobre monitoramento ambiental, pesquisas científicas e avanços tecnológicos
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoaderIcon className="h-8 w-8 animate-spin text-teal-600 mr-3" />
            <span className="text-lg text-gray-600">Carregando notícias...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <NewspaperIcon className="h-20 w-20 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              Nenhuma notícia disponível
            </h2>
            <p className="text-gray-600 text-lg">
              Não há notícias publicadas no momento.
            </p>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-600">{news.length}</div>
                  <div className="text-sm text-gray-600">Total de Notícias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {news.filter(n => n.category === 'Tecnologia').length}
                  </div>
                  <div className="text-sm text-gray-600">Tecnologia</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {news.filter(n => n.category === 'Meio Ambiente').length}
                  </div>
                  <div className="text-sm text-gray-600">Meio Ambiente</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {news.filter(n => n.category === 'Pesquisa').length}
                  </div>
                  <div className="text-sm text-gray-600">Pesquisa</div>
                </div>
              </div>
            </div>

            {/* Grid de notícias */}
            <div className="grid gap-6">
              {news.map((article, index) => (
                <Card key={article.id} className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${
                  index === 0 ? 'border-l-teal-500 bg-gradient-to-r from-teal-50 to-white' :
                  index === 1 ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white' :
                  index === 2 ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' :
                  'border-l-gray-300'
                } ${index < 3 ? 'transform hover:scale-[1.02]' : ''}`}>
                  <div className={`grid ${index < 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6`}>
                    {/* Imagem */}
                    <div className={`${index < 3 ? 'md:col-span-1' : 'md:col-span-1'}`}>
                      <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg relative overflow-hidden">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                            <NewspaperIcon className="h-12 w-12 text-teal-600/50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className={`${index < 3 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(article.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {article.read_time}
                          </div>
                          <div className="flex items-center gap-1 text-teal-600">
                            <span className="font-medium">Por {article.author}</span>
                          </div>
                        </div>
                        <CardTitle className={`${index < 3 ? 'text-2xl' : 'text-xl'} leading-tight group-hover:text-teal-600 transition-colors`}>
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="flex flex-col">
                        <p className={`text-gray-600 ${index < 3 ? 'text-base mb-6' : 'text-sm mb-4'} line-clamp-3 flex-1`}>
                          {article.summary}
                        </p>
                        <Link to={`/news/${article.id}`} className="self-start">
                          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-semibold">
                            Leia a notícia completa →
                          </Button>
                        </Link>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Rodapé da página */}
            <div className="text-center mt-12 py-8 border-t border-gray-200">
              <p className="text-gray-600">
                Mostrando {news.length} notícias • Última atualização: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllNews;
