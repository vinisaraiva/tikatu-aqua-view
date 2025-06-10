
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, LeafIcon, GlobalIcon, TargetIcon, TrendingUpIcon, UsersIcon, ShieldIcon, EyeIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Agenda2030 = () => {
  const odsData = [
    {
      id: 6,
      title: "Água Potável e Saneamento",
      description: "Assegurar a disponibilidade e gestão sustentável da água e saneamento para todas e todos",
      icon: DropletIcon,
      color: "bg-blue-500",
      colorLight: "bg-blue-50",
      textColor: "text-blue-600",
      contribution: [
        "Monitoramento em tempo real da qualidade da água",
        "Detecção precoce de contaminantes",
        "Dados para tomada de decisões em saneamento",
        "Suporte à gestão sustentável dos recursos hídricos"
      ]
    },
    {
      id: 14,
      title: "Vida na Água",
      description: "Conservar e promover o uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável",
      icon: LeafIcon,
      color: "bg-teal-500",
      colorLight: "bg-teal-50",
      textColor: "text-teal-600",
      contribution: [
        "Monitoramento da qualidade de águas costeiras",
        "Prevenção da poluição marinha",
        "Proteção de ecossistemas aquáticos",
        "Dados para conservação da biodiversidade aquática"
      ]
    },
    {
      id: 17,
      title: "Parcerias e Meios de Implementação",
      description: "Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável",
      icon: GlobalIcon,
      color: "bg-purple-500",
      colorLight: "bg-purple-50",
      textColor: "text-purple-600",
      contribution: [
        "Plataforma de dados abertos e transparentes",
        "Colaboração entre instituições públicas e privadas",
        "Compartilhamento de conhecimento técnico",
        "Fortalecimento de capacidades locais"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Agenda 2030 e a Água
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A Agenda 2030 é um plano de ação global adotado pelas Nações Unidas em 2015, 
              composto por 17 Objetivos de Desenvolvimento Sustentável (ODS) que visam 
              acabar com a pobreza, proteger o planeta e garantir prosperidade para todos.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Os ODS são um apelo universal para ação, buscando equilibrar as três dimensões 
              do desenvolvimento sustentável: econômica, social e ambiental. Nossa plataforma 
              contribui diretamente para vários desses objetivos através do monitoramento 
              da qualidade da água.
            </p>
          </div>
        </div>

        {/* O que são os ODS */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              O que são os Objetivos de Desenvolvimento Sustentável?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TargetIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">17 Objetivos</h3>
                <p className="text-gray-600 text-sm">
                  Metas interconectadas para transformar o mundo
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-water-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="h-8 w-8 text-water-blue" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Até 2030</h3>
                <p className="text-gray-600 text-sm">
                  Prazo para alcançar as metas estabelecidas
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-teal-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Todos Incluídos</h3>
                <p className="text-gray-600 text-sm">
                  "Não deixar ninguém para trás"
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-forest-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldIcon className="h-8 w-8 text-forest-green" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Planeta</h3>
                <p className="text-gray-600 text-sm">
                  Proteger nosso planeta da degradação
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ODS Relacionados */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ODS Relacionados à Nossa Plataforma
          </h2>
          <div className="space-y-8">
            {odsData.map((ods, index) => (
              <Card key={ods.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className={`${ods.colorLight} p-8 lg:w-1/3 flex flex-col items-center justify-center text-center`}>
                    <div className={`w-20 h-20 ${ods.color} rounded-full flex items-center justify-center mb-4`}>
                      <ods.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className={`text-2xl font-bold ${ods.textColor} mb-2`}>
                      ODS {ods.id}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {ods.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {ods.description}
                    </p>
                  </div>
                  <div className="lg:w-2/3 p-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <EyeIcon className="h-5 w-5 mr-2 text-primary" />
                      Como nossa plataforma contribui:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {ods.contribution.map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <p className="text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-teal-accent rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Juntos pela Sustentabilidade
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Nossa plataforma é parte da solução para um futuro mais sustentável. 
              Monitore, analise e contribua para a preservação dos recursos hídricos.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="https://sdgs.un.org/goals" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Saiba Mais sobre os ODS
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Agenda2030;
