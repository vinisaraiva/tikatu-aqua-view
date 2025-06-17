
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropletIcon, UsersIcon, TargetIcon, ShieldCheckIcon, CodeIcon, DatabaseIcon, BarChart3Icon, PhoneIcon, MailIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre o Tikatu
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Tecnologia avançada para monitoramento da qualidade da água e preservação dos recursos hídricos
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard">
              <Button
                variant="secondary"
                className="bg-white text-teal-600 hover:bg-gray-100 transition-colors"
              >
                <DropletIcon className="h-4 w-4 mr-2" />
                Explorar Plataforma
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-teal-600 transition-colors"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Nossa Equipe
            </Button>
          </div>
        </div>
      </section>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mission Section */}
        <section className="mb-16">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-teal-accent/5 p-8">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TargetIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                  O Tikatu é uma plataforma digital inovadora desenvolvida para facilitar o acesso 
                  e a análise de dados de monitoramento da qualidade da água. Nossa missão é 
                  democratizar o acesso à informação ambiental, permitindo que gestores públicos, 
                  pesquisadores e cidadãos tomem decisões baseadas em dados precisos e atualizados.
                </p>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nossos Recursos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <DropletIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Monitoramento em Tempo Real</CardTitle>
                <CardDescription>
                  Dados atualizados constantemente de estações de monitoramento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Nossa plataforma coleta e processa dados de qualidade da água em tempo real, 
                  oferecendo uma visão atualizada das condições ambientais.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-water-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-water-blue/20 transition-colors">
                  <UsersIcon className="h-8 w-8 text-water-blue" />
                </div>
                <CardTitle className="text-xl">Interface Intuitiva</CardTitle>
                <CardDescription>
                  Design pensado para facilitar o acesso à informação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Desenvolvemos uma interface simples e intuitiva que permite a qualquer 
                  usuário navegar e compreender os dados de forma eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-accent/20 transition-colors">
                  <BarChart3Icon className="h-8 w-8 text-teal-accent" />
                </div>
                <CardTitle className="text-xl">Análise Avançada</CardTitle>
                <CardDescription>
                  Relatórios e insights baseados em inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  Utilizamos algoritmos avançados para detectar anomalias e 
                  fornecer insights valiosos sobre a qualidade da água.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-16">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-forest-green/5 to-water-blue/5 p-8">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-forest-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CodeIcon className="h-8 w-8 text-forest-green" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Tecnologia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center max-w-3xl mx-auto">
                  O Tikatu utiliza tecnologias modernas para garantir performance, 
                  escalabilidade e uma experiência de usuário excepcional:
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Code className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Frontend React e TypeScript</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <DropletIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <span className="text-gray-700">Interface responsiva Tailwind</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3Icon className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Gráficos interativos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DatabaseIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">API RESTful</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ShieldCheckIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700">Análise de anomalias</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-gray-700">Interface colaborativa</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-sky-blue/5 p-8">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Entre em Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <MailIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Informações Gerais</h3>
                    <p className="text-gray-700">
                      Email: contato@tikatu.com.br<br />
                      Telefone: (11) 9999-9999
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-water-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="h-6 w-6 text-water-blue" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Suporte Técnico</h3>
                    <p className="text-gray-700">
                      Email: suporte@tikatu.com.br<br />
                      Horário: Segunda a Sexta, 8h às 18h
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
