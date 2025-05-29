
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, UsersIcon, TargetIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sobre o Tikatu
          </h1>
          <p className="text-xl text-gray-600">
            Tecnologia avançada para monitoramento da qualidade da água
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TargetIcon className="h-8 w-8 text-teal-600" />
              <CardTitle className="text-2xl">Nossa Missão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              O Tikatu é uma plataforma digital inovadora desenvolvida para facilitar o acesso 
              e a análise de dados de monitoramento da qualidade da água. Nossa missão é 
              democratizar o acesso à informação ambiental, permitindo que gestores públicos, 
              pesquisadores e cidadãos tomem decisões baseadas em dados precisos e atualizados.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <DropletIcon className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>
                Dados atualizados constantemente de estações de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Nossa plataforma coleta e processa dados de qualidade da água em tempo real, 
                oferecendo uma visão atualizada das condições ambientais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <UsersIcon className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle>Interface Intuitiva</CardTitle>
              <CardDescription>
                Design pensado para facilitar o acesso à informação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Desenvolvemos uma interface simples e intuitiva que permite a qualquer 
                usuário navegar e compreender os dados de forma eficiente.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Tecnologia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              O Tikatu utiliza tecnologias modernas para garantir performance, 
              escalabilidade e uma experiência de usuário excepcional:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Frontend desenvolvido com React e TypeScript</li>
              <li>Interface responsiva construída com Tailwind CSS</li>
              <li>Visualização de dados com gráficos interativos</li>
              <li>API RESTful para integração de dados</li>
              <li>Análise inteligente de anomalias</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Informações Gerais</h3>
                <p className="text-gray-700">
                  Email: contato@tikatu.com.br<br />
                  Telefone: (11) 9999-9999
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Suporte Técnico</h3>
                <p className="text-gray-700">
                  Email: suporte@tikatu.com.br<br />
                  Horário: Segunda a Sexta, 8h às 18h
                </p>
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
