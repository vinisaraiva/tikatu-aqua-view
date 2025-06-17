
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
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre o Tikatu
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Tecnologia avançada para monitoramento da qualidade da água e preservação dos recursos hídricos
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-teal-600 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <DropletIcon className="h-5 w-5 mr-2" />
                Explorar Plataforma
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-teal-600 transition-all duration-300"
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              Nossa Equipe
            </Button>
          </div>
        </div>
      </section>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Mission Section */}
        <section className="mb-20">
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="bg-gradient-to-r from-primary/5 to-teal-accent/5 p-12">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TargetIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold text-gray-900 mb-4">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
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
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Recursos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnologia de ponta para monitoramento e análise da qualidade da água
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-all duration-300 shadow-lg">
                  <DropletIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">Monitoramento em Tempo Real</CardTitle>
                <CardDescription className="text-base">
                  Dados atualizados constantemente de estações de monitoramento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center leading-relaxed">
                  Nossa plataforma coleta e processa dados de qualidade da água em tempo real, 
                  oferecendo uma visão atualizada das condições ambientais.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-teal-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-water-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-water-blue/20 transition-all duration-300 shadow-lg">
                  <UsersIcon className="h-10 w-10 text-water-blue" />
                </div>
                <CardTitle className="text-2xl mb-3">Interface Intuitiva</CardTitle>
                <CardDescription className="text-base">
                  Design pensado para facilitar o acesso à informação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center leading-relaxed">
                  Desenvolvemos uma interface simples e intuitiva que permite a qualquer 
                  usuário navegar e compreender os dados de forma eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-teal-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-accent/20 transition-all duration-300 shadow-lg">
                  <BarChart3Icon className="h-10 w-10 text-teal-accent" />
                </div>
                <CardTitle className="text-2xl mb-3">Análise Avançada</CardTitle>
                <CardDescription className="text-base">
                  Relatórios e insights baseados em inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center leading-relaxed">
                  Utilizamos algoritmos avançados para detectar anomalias e 
                  fornecer insights valiosos sobre a qualidade da água.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-20">
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="bg-gradient-to-r from-forest-green/5 to-water-blue/5 p-12">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-forest-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CodeIcon className="h-10 w-10 text-forest-green" />
                </div>
                <CardTitle className="text-4xl font-bold text-gray-900 mb-4">Tecnologia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-gray-700 leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                  O Tikatu utiliza tecnologias modernas para garantir performance, 
                  escalabilidade e uma experiência de usuário excepcional:
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                      <CodeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Frontend React e TypeScript</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shadow-md">
                      <DropletIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Interface responsiva Tailwind</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Gráficos interativos</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                      <DatabaseIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">API RESTful</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-md">
                      <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Análise de anomalias</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shadow-md">
                      <UsersIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Interface colaborativa</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* Contact Section */}
        <section>
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="bg-gradient-to-r from-primary/5 to-sky-blue/5 p-12">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <PhoneIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold text-gray-900 mb-4">Entre em Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MailIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-2xl mb-4">Informações Gerais</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Email: contato@tikatu.com.br<br />
                      Telefone: (11) 9999-9999
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-water-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UsersIcon className="h-8 w-8 text-water-blue" />
                    </div>
                    <h3 className="font-bold text-2xl mb-4">Suporte Técnico</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
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
