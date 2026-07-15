import { Button } from "@/components/ui/button";
import ForumFlowDiagram from "./ForumFlowDiagram";

const ForumHero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Demonstração baseada na plataforma Tikatu
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            A qualidade do mar também começa nos rios
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Explore uma coleta real, visualize os parâmetros monitorados e veja
            como o Tikatu organiza e interpreta dados de qualidade da água.
          </p>

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              I Fórum de Economia do Mar de Porto Seguro
            </p>
            <p>Expo Conectando Saberes · 17 de julho de 2026</p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <a href="#coleta">Explorar uma coleta</a>
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <ForumFlowDiagram />
        </div>
      </div>
    </section>
  );
};

export default ForumHero;
