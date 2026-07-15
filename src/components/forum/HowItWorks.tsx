import { Card } from "@/components/ui/card";
import {
  Database,
  ShieldCheck,
  BarChart3,
  BookOpenText,
  Send,
} from "lucide-react";

const STEPS = [
  {
    Icon: Database,
    title: "Coleta de dados",
    text: "Dados de campanhas, laboratórios, bases públicas ou sensores.",
  },
  {
    Icon: ShieldCheck,
    title: "Validação",
    text: "Verificação de unidades, campos ausentes e valores inconsistentes.",
  },
  {
    Icon: BarChart3,
    title: "Indicadores",
    text: "Cálculo de índices e comparação com critérios técnicos.",
  },
  {
    Icon: BookOpenText,
    title: "Interpretação",
    text: "Organização dos resultados em linguagem compreensível.",
  },
  {
    Icon: Send,
    title: "Comunicação",
    text: "Relatórios, mapas, gráficos e alertas.",
  },
];

const HowItWorks = () => {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Como funciona o Tikatu
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Um fluxo simples que vai da coleta em campo à comunicação dos
          resultados.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ Icon, title, text }, i) => (
            <Card key={title} className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
