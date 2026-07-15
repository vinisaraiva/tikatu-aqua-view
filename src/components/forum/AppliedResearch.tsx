import { FlaskConical, Cpu, Wrench, Sprout } from "lucide-react";

const STEPS = [
  { Icon: FlaskConical, label: "Ciência" },
  { Icon: Cpu, label: "Tecnologia" },
  { Icon: Wrench, label: "Aplicação" },
  { Icon: Sprout, label: "Impacto" },
];

const AppliedResearch = () => {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Pesquisa aplicada e desenvolvimento tecnológico
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          O Tikatu é desenvolvido no âmbito do Doutorado em Biossistemas da
          Universidade Federal do Sul da Bahia. A pesquisa investiga o uso de
          ciência de dados, inteligência artificial e tecnologias digitais no
          monitoramento da qualidade da água e na comunicação de resultados
          ambientais.
        </p>
        <ol className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">
          {STEPS.map(({ Icon, label }, i) => (
            <li key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm font-medium">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default AppliedResearch;
