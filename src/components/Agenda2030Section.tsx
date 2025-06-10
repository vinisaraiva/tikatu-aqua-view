
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropletIcon, ArrowRightIcon, GoalIcon, LeafIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Agenda2030Section = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-sm font-medium mb-2">Sustentabilidade Global</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tikatu e a Agenda 2030
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conheça como nossa plataforma contribui para os Objetivos de Desenvolvimento 
            Sustentável (ODS) da ONU, especialmente no monitoramento da qualidade da água 
            e preservação dos recursos hídricos.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="feature-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <DropletIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">ODS 6</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Água Potável e Saneamento - Garantir disponibilidade e gestão sustentável da água
              </p>
              <div className="bg-primary/5 rounded-lg p-3">
                <span className="text-sm text-primary font-medium">
                  Monitoramento em tempo real
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-forest-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-forest-green/20 transition-colors">
                <LeafIcon className="h-8 w-8 text-forest-green" />
              </div>
              <CardTitle className="text-xl">ODS 14</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Vida na Água - Conservar e usar sustentavelmente os oceanos e recursos marinhos
              </p>
              <div className="bg-forest-green/5 rounded-lg p-3">
                <span className="text-sm text-forest-green font-medium">
                  Proteção dos ecossistemas
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="feature-card group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-accent/20 transition-colors">
                <GoalIcon className="h-8 w-8 text-teal-accent" />
              </div>
              <CardTitle className="text-xl">ODS 17</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Parcerias e Meios de Implementação - Fortalecer parcerias globais
              </p>
              <div className="bg-teal-accent/5 rounded-lg p-3">
                <span className="text-sm text-teal-accent font-medium">
                  Dados abertos e transparentes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/agenda-2030">
            <Button className="btn-primary">
              Saiba Mais sobre os ODS
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Agenda2030Section;
