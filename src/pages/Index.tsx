
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, TrendingUpIcon, MapIcon, FileTextIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsSection from '@/components/NewsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/lovable-uploads/6c1c5451-5d11-445d-ac6a-b3c2450303b6.png')`
        }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png" 
              alt="Tikatu Logo" 
              className="h-20 mx-auto mb-6 drop-shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Monitoramento da Qualidade da Água
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
            Plataforma digital para consulta e visualização de dados de monitoramento 
            da qualidade da água em tempo real. Acesse informações detalhadas sobre 
            parâmetros físico-químicos e detecção de anomalias.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 shadow-lg">
                Acessar Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recursos da Plataforma
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <DropletIcon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <CardTitle>Leituras Recentes</CardTitle>
                <CardDescription>
                  Visualize os dados mais recentes de qualidade da água
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUpIcon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <CardTitle>Análise de Anomalias</CardTitle>
                <CardDescription>
                  Identifique padrões anômalos nos parâmetros monitorados
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapIcon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <CardTitle>Mapeamento</CardTitle>
                <CardDescription>
                  Localize pontos de coleta geograficamente
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileTextIcon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados em formato PDF
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Acesse Dados Ambientais em Tempo Real
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Monitore a qualidade da água com precisão e tome decisões baseadas em dados
          </p>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary">
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
