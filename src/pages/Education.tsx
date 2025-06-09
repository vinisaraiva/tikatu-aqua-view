
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpenIcon, 
  TestTube, 
  BrainIcon, 
  GamepadIcon, 
  ClockIcon, 
  EyeIcon,
  ChevronRightIcon 
} from "lucide-react";
import GlossaryAccordion from "@/components/education/GlossaryAccordion";
import ScenarioSimulator from "@/components/education/ScenarioSimulator";
import EnvironmentalQuiz from "@/components/education/EnvironmentalQuiz";
import RiverChallenge from "@/components/education/RiverChallenge";
import EventTimeline from "@/components/education/EventTimeline";
import CitizenForm from "@/components/education/CitizenForm";

const Education = () => {
  const [activeSection, setActiveSection] = useState("glossario");

  const sections = [
    {
      id: "glossario",
      title: "Glossário Interativo",
      icon: BookOpenIcon,
      description: "Termos técnicos explicados de forma simples",
      component: GlossaryAccordion
    },
    {
      id: "simulador",
      title: "Simulador de Cenários",
      icon: TestTube,
      description: "Veja como parâmetros afetam a qualidade da água",
      component: ScenarioSimulator
    },
    {
      id: "quiz",
      title: "Quiz Gamificado",
      icon: BrainIcon,
      description: "Teste seus conhecimentos sobre qualidade da água",
      component: EnvironmentalQuiz
    },
    {
      id: "desafio",
      title: "Desafio Rio Vivo",
      icon: GamepadIcon,
      description: "Tome decisões como gestor ambiental",
      component: RiverChallenge
    },
    {
      id: "timeline",
      title: "Linha do Tempo",
      icon: ClockIcon,
      description: "História da gestão de recursos hídricos",
      component: EventTimeline
    },
    {
      id: "citizen",
      title: "Citizen Science",
      icon: EyeIcon,
      description: "Contribua com observações da comunidade",
      component: CitizenForm
    }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component || GlossaryAccordion;

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById('content-area');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Educação Ambiental Tikatu
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Entenda, simule, teste e contribua para a saúde dos rios
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "outline"}
                  onClick={() => scrollToSection(section.id)}
                  className={`${
                    activeSection === section.id 
                      ? "bg-white text-teal-600" 
                      : "border-white text-white hover:bg-white hover:text-teal-600"
                  } transition-colors`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.title}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navigation Sidebar + Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Módulos Educativos</h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "default" : "ghost"}
                        onClick={() => scrollToSection(section.id)}
                        className="w-full justify-start text-left h-auto p-3"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{section.title}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {section.description}
                            </div>
                          </div>
                          {activeSection === section.id && (
                            <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3" id="content-area">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-600">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>

              {/* Active Component */}
              <div className="min-h-[400px]">
                <ActiveComponent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Compartilhe Conhecimento, Proteja Nossos Rios
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Use o que aprendeu para fazer a diferença em sua comunidade
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => scrollToSection("citizen")}>
              <EyeIcon className="h-5 w-5 mr-2" />
              Faça uma Observação
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("quiz")}>
              <BrainIcon className="h-5 w-5 mr-2" />
              Testar Conhecimentos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Education;
