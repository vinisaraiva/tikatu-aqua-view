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
        className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-black/25"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-black/45 backdrop-blur-sm px-5 py-8 text-center sm:px-8 sm:py-10">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs font-medium text-white">
            Demonstração baseada na plataforma Tikatu
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)] sm:text-4xl md:text-5xl">
            A qualidade do mar também começa nos rios
          </h1>
          <p className="mt-4 text-base text-white/95 [text-shadow:_0_1px_4px_rgb(0_0_0_/_60%)] sm:text-lg">
            Explore uma coleta real, visualize os parâmetros monitorados e veja
            como o Tikatu organiza e interpreta dados de qualidade da água.
          </p>

          <div className="mt-6 space-y-1 text-sm text-white [text-shadow:_0_1px_4px_rgb(0_0_0_/_60%)]">
            <p className="font-semibold">
              I Fórum de Economia do Mar de Porto Seguro
            </p>
            <p className="text-white/90">Expo Conectando Saberes · 17 de julho de 2026</p>
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
