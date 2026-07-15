import { Button } from "@/components/ui/button";
import ForumFlowDiagram from "./ForumFlowDiagram";

const ForumHero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/6c1c5451-5d11-445d-ac6a-b3c2450303b6.png')`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/85 backdrop-blur-[1px]"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Demonstração baseada na plataforma Tikatu
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-foreground drop-shadow-sm sm:text-4xl md:text-5xl">
            A qualidade do mar também começa nos rios
          </h1>
          <p className="mt-4 text-base text-foreground/80 sm:text-lg">
            Explore uma coleta real, visualize os parâmetros monitorados e veja
            como o Tikatu organiza e interpreta dados de qualidade da água.
          </p>

          <div className="mt-6 space-y-1 text-sm text-foreground/80">
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
