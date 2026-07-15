import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

const POINTS = [
  "não altera resultados laboratoriais",
  "não substitui medições",
  "não define sozinha a conformidade",
  "não substitui especialistas",
];

const AIRoleSection = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-semibold sm:text-3xl">
        O papel da inteligência artificial
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        No Tikatu, os cálculos, classificações e verificações técnicas são
        realizados por procedimentos definidos. A inteligência artificial é
        utilizada principalmente para organizar e comunicar os resultados em
        linguagem acessível.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((p) => (
          <Card key={p} className="flex items-start gap-3 p-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X className="h-3.5 w-3.5" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed">{p}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AIRoleSection;
