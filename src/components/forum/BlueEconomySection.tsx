import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Fish, Umbrella, Compass, GraduationCap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ForumFlowDiagram from "./ForumFlowDiagram";

const ITEMS = [
  {
    Icon: Umbrella,
    title: "Turismo e recreação",
    text: "A qualidade da água influencia a percepção de balneabilidade e a experiência em praias, rios e estuários.",
  },
  {
    Icon: Fish,
    title: "Pesca e aquicultura",
    text: "Variações em oxigênio, nutrientes e temperatura afetam estoques pesqueiros e cultivos.",
  },
  {
    Icon: Compass,
    title: "Gestão costeira",
    text: "Séries históricas ajudam a identificar tendências e apoiar decisões de acompanhamento.",
  },
  {
    Icon: GraduationCap,
    title: "Pesquisa e educação ambiental",
    text: "Dados organizados apoiam projetos escolares, extensão universitária e ciência cidadã.",
  },
];

const BlueEconomySection = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-semibold sm:text-3xl">Da bacia ao mar</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
        Alterações na qualidade da água de rios podem alcançar ambientes
        costeiros. O monitoramento ajuda a identificar tendências e apoiar
        ações de acompanhamento relacionadas ao turismo, à pesca, à
        aquicultura e à gestão ambiental.
      </p>

      <div className="mt-6">
        <ForumFlowDiagram />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, text }, i) => {
          const isOpen = open === i;
          return (
            <Card key={title} className="p-5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="text-sm font-semibold">{title}</span>
                </div>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default BlueEconomySection;
