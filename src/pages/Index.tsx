
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, TrendingUpIcon, MapIcon, FileTextIcon, ArrowRightIcon, ShieldCheckIcon, DatabaseIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsSection from '@/components/NewsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section - Professional */}
      <section className="relative hero-professional overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium">
              <DropletIcon className="h-4 w-4" />
              Monitoramento em Tempo Real
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Qualidade da Água
              <span className="block text-cyan-300">Monitorada</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              Plataforma profissional para análise e visualização de dados ambientais. 
              Monitore parâmetros físico-químicos, detecte anomalias e gere relatórios técnicos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  Acessar Plataforma
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-4 rounded-lg backdrop-blur-sm transition-all duration-300">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-3 animate-slide-in-left">
              <div className="bg-cyan-100 p-4 rounded-full">
                <DatabaseIcon className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">1000+</h3>
                <p className="text-slate-600 font-medium">Pontos Monitorados</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <div className="bg-blue-100 p-4 rounded-full">
                <TrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">24/7</h3>
                <p className="text-slate-600 font-medium">Monitoramento Contínuo</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="bg-teal-100 p-4 rounded-full">
                <ShieldCheckIcon className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
                <p className="text-slate-600 font-medium">Precisão dos Dados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              Recursos da Plataforma
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Ferramentas profissionais para análise completa da qualidade da água
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="water-card group hover:scale-105 transition-transform duration-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl mx-auto mb-4 w-fit group-hover:shadow-lg transition-shadow">
                  <DropletIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Leituras em Tempo Real</CardTitle>
                <CardDescription className="text-slate-600">
                  Dados atualizados continuamente de estações de monitoramento
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="water-card group hover:scale-105 transition-transform duration-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl mx-auto mb-4 w-fit group-hover:shadow-lg transition-shadow">
                  <TrendingUpIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Análise de Anomalias</CardTitle>
                <CardDescription className="text-slate-600">
                  Identificação inteligente de padrões anômalos nos parâmetros
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="water-card group hover:scale-105 transition-transform duration-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-xl mx-auto mb-4 w-fit group-hover:shadow-lg transition-shadow">
                  <MapIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Mapeamento Interativo</CardTitle>
                <CardDescription className="text-slate-600">
                  Visualização geográfica dos pontos de coleta e dados
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="water-card group hover:scale-105 transition-transform duration-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-br from-slate-500 to-slate-700 p-4 rounded-xl mx-auto mb-4 w-fit group-hover:shadow-lg transition-shadow">
                  <FileTextIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">Relatórios Técnicos</CardTitle>
                <CardDescription className="text-slate-600">
                  Geração de relatórios profissionais em formato PDF
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* CTA Section - Professional */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-8">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            Monitore com Precisão Profissional
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Acesse dados ambientais em tempo real e tome decisões baseadas em análises científicas confiáveis
          </p>
          <div className="pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Iniciar Monitoramento
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
