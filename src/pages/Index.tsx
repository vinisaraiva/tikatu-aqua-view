
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, TrendingUpIcon, MapIcon, FileTextIcon, ArrowRightIcon, BarChart3Icon, ShieldCheckIcon, ClockIcon, UsersIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsSection from '@/components/NewsSection';
import Agenda2030Section from '@/components/Agenda2030Section';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-light-water/30">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/6c1c5451-5d11-445d-ac6a-b3c2450303b6.png')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Monitoramento Avançado da
              <span className="block text-sky-blue">Qualidade da Água</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              Plataforma digital para consulta e visualização de dados de monitoramento 
              da qualidade da água em tempo real. Acesse informações detalhadas sobre 
              parâmetros físico-químicos e detecção de anomalias.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/dashboard">
                <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  Acessar Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white hover:text-teal-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stats-card animate-slide-up">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-gray-600 font-medium">Pontos de Coleta</div>
            </div>
            <div className="stats-card animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl font-bold text-water-blue mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Monitoramento</div>
            </div>
            <div className="stats-card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-teal-accent mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Disponibilidade</div>
            </div>
            <div className="stats-card animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold text-forest-green mb-2">12</div>
              <div className="text-gray-600 font-medium">Parâmetros</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4 font-bold">
              Recursos da Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia avançada para monitoramento, análise e gestão da qualidade da água
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card p-8 text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <DropletIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Leituras em Tempo Real</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Visualize os dados mais recentes de qualidade da água com atualização automática
              </CardDescription>
            </div>
            
            <div className="feature-card p-8 text-center group">
              <div className="w-16 h-16 bg-water-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-water-blue/20 transition-colors">
                <TrendingUpIcon className="h-8 w-8 text-water-blue" />
              </div>
              <CardTitle className="text-xl mb-3">Análise de Anomalias</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Identifique padrões anômalos nos parâmetros monitorados com IA avançada
              </CardDescription>
            </div>
            
            <div className="feature-card p-8 text-center group">
              <div className="w-16 h-16 bg-teal-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-accent/20 transition-colors">
                <MapIcon className="h-8 w-8 text-teal-accent" />
              </div>
              <CardTitle className="text-xl mb-3">Mapeamento Interativo</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Localize pontos de coleta geograficamente com mapas interativos
              </CardDescription>
            </div>
            
            <div className="feature-card p-8 text-center group">
              <div className="w-16 h-16 bg-forest-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-forest-green/20 transition-colors">
                <FileTextIcon className="h-8 w-8 text-forest-green" />
              </div>
              <CardTitle className="text-xl mb-3">Relatórios Técnicos</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Gere relatórios detalhados e exportações em múltiplos formatos
              </CardDescription>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features - Por que escolher o Tikatu */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-water-blue/5 to-teal-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-teal-accent/5" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-water-blue/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-gray-900 mb-6 font-bold">
                Por que escolher o Tikatu?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Precisão Confiável</h3>
                    <p className="text-gray-600">Dados validados e certificados seguindo normas CONAMA</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-water-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-water-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Resposta Rápida</h3>
                    <p className="text-gray-600">Alertas automáticos para situações críticas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3Icon className="h-6 w-6 text-teal-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Análise Avançada</h3>
                    <p className="text-gray-600">Tendências, previsões e insights inteligentes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-forest-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-forest-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Interface Intuitiva</h3>
                    <p className="text-gray-600">Design pensado para todos os tipos de usuários</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="feature-card p-8">
              <h3 className="font-bold text-xl mb-4 text-center">Acesso Rápido</h3>
              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button className="w-full btn-primary">
                    <DropletIcon className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/indices">
                  <Button variant="outline" className="w-full">
                    <BarChart3Icon className="mr-2 h-5 w-5" />
                    Índices IQA/IET
                  </Button>
                </Link>
                <Link to="/education">
                  <Button variant="outline" className="w-full">
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    Educação
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section - Em Destaque */}
      <div className="relative bg-gradient-to-br from-white/95 via-primary/5 to-water-blue/10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-light-water/20" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-24 h-24 bg-teal-accent/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <NewsSection />
        </div>
      </div>

      {/* Agenda 2030 Section */}
      <Agenda2030Section />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Acesse Dados Ambientais em Tempo Real
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Monitore a qualidade da água com precisão e tome decisões baseadas em dados confiáveis
          </p>
          <Link to="/dashboard">
            <Button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              Começar Agora
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
