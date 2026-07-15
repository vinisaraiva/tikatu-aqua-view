import { Card } from "@/components/ui/card";

const Team = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14">
      <h2 className="text-2xl font-semibold sm:text-3xl">Responsáveis</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Desenvolvimento do projeto
          </p>
          <h3 className="mt-2 text-lg font-semibold">Vinícius Saraiva Santos</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Instituto Federal da Bahia</li>
            <li>Doutorando em Biossistemas pela UFSB</li>
            <li>Grupo de Pesquisa NuPEcoTropic</li>
          </ul>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Orientação científica
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            Prof. Dr. Fabrício Berton Zanchi
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Universidade Federal do Sul da Bahia</li>
          </ul>
        </Card>
      </div>
      <div className="mt-8 flex justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href="#publicacao">Produção científica</a>
        </Button>
      </div>
    </section>
  );
};

export default Team;
