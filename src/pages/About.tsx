
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, UsersIcon, TargetIcon, AwardIcon, GlobeIcon, BrainIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-cyan-900 to-teal-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-4">
            <DropletIcon className="h-4 w-4" />
            Sobre o Tikatu
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            Tecnologia Avançada para 
            <span className="block text-cyan-300">Monitoramento da Água</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed font-light max-w-3xl mx-auto">
            Plataforma profissional que democratiza o acesso à informação ambiental, 
            permitindo decisões baseadas em dados científicos precisos e atualizados.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Mission Section */}
        <Card className="water-card mb-12 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-3 rounded-xl">
                <TargetIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-slate-900">Nossa Missão</CardTitle>
                <CardDescription className="text-lg text-slate-600">Democratizando o acesso à informação ambiental</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              O Tikatu é uma plataforma digital inovadora desenvolvida para facilitar o acesso 
              e a análise de dados de monitoramento da qualidade da água. Nossa missão é 
              democratizar o acesso à informação ambiental, permitindo que gestores públicos, 
              pesquisadores e cidadãos tomem decisões baseadas em dados precisos e atualizados.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="water-card group hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl mx-auto mb-4 w-fit">
                <AwardIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-slate-900">Excelência</CardTitle>
              <CardDescription className="text-slate-600">
                Compromisso com a qualidade e precisão dos dados
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="water-card group hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-br from-teal-500 to-green-600 p-4 rounded-xl mx-auto mb-4 w-fit">
                <GlobeIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-slate-900">Sustentabilidade</CardTitle>
              <CardDescription className="text-slate-600">
                Proteção dos recursos hídricos para futuras gerações
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="water-card group hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl mx-auto mb-4 w-fit">
                <BrainIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-slate-900">Inovação</CardTitle>
              <CardDescription className="text-slate-600">
                Tecnologia de ponta para análise inteligente
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="water-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-lg">
                  <DropletIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Monitoramento em Tempo Real</CardTitle>
                  <CardDescription className="text-slate-600">
                    Dados atualizados constantemente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                Nossa plataforma coleta e processa dados de qualidade da água em tempo real, 
                oferecendo uma visão atualizada e precisa das condições ambientais através 
                de estações de monitoramento distribuídas estrategicamente.
              </p>
            </CardContent>
          </Card>

          <Card className="water-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Interface Profissional</CardTitle>
                  <CardDescription className="text-slate-600">
                    Design pensado para eficiência
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                Desenvolvemos uma interface moderna e intuitiva que permite a profissionais 
                e pesquisadores navegar e compreender dados complexos de forma eficiente, 
                facilitando a tomada de decisões informadas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Section */}
        <Card className="water-card mb-12">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-3xl text-slate-900">Tecnologia de Ponta</CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Infraestrutura moderna para máxima performance e confiabilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              O Tikatu utiliza tecnologias modernas para garantir performance, 
              escalabilidade e uma experiência profissional excepcional:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Frontend desenvolvido com React e TypeScript
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Interface responsiva construída com Tailwind CSS
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Visualização de dados com gráficos interativos
                </li>
              </ul>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  API RESTful para integração de dados
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Análise inteligente de anomalias
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Infraestrutura em nuvem escalável
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="water-card">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
            <CardTitle className="text-3xl text-slate-900">Entre em Contato</CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Nossa equipe está pronta para ajudar você
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-xl text-slate-900">Informações Gerais</h3>
                <div className="space-y-2 text-slate-700">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span> contato@tikatu.com.br
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Telefone:</span> (11) 9999-9999
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-xl text-slate-900">Suporte Técnico</h3>
                <div className="space-y-2 text-slate-700">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Email:</span> suporte@tikatu.com.br
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Horário:</span> Segunda a Sexta, 8h às 18h
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default About;
