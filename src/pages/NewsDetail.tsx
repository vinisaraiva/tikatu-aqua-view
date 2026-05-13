
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CalendarIcon, TagIcon, UserIcon, LoaderIcon, AlertCircleIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNewsById } from '@/hooks/useNews';

const NewsDetail = () => {
  const { id } = useParams();
  const { data: article, isLoading, error } = useNewsById(id || '');

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'bg-blue-100 text-blue-800',
      'Meio Ambiente': 'bg-green-100 text-green-800',
      'Pesquisa': 'bg-purple-100 text-purple-800',
      'Educação': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <LoaderIcon className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Carregando notícia...</h1>
              <p className="text-gray-600">Aguarde enquanto buscamos o conteúdo.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Notícia não encontrada</h1>
              <p className="text-gray-600 mb-6">
                A notícia que você está procurando não existe ou foi removida.
              </p>
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
                <span className="text-sm text-gray-500">{article.read_time} de leitura</span>
              </div>
              
              <CardTitle className="text-3xl leading-tight text-gray-900">
                {article.title}
              </CardTitle>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(article.created_at).toLocaleDateString('pt-BR', {
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
              {article.image_url ? (
                <div className="aspect-video rounded-lg mb-8 relative overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TagIcon className="h-16 w-16 text-teal-600/50" />
                  </div>
                </div>
              )}
              
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content, {
                  ALLOWED_TAGS: ['p','br','strong','em','u','h1','h2','h3','h4','ul','ol','li','a','blockquote','code','pre','img','figure','figcaption'],
                  ALLOWED_ATTR: ['href','target','rel','src','alt','title']
                }) }}
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
