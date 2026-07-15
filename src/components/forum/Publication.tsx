import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";

// === Atualize aqui as informações da publicação ===
const PUBLICATION = {
  title:
    "TIKATU: Development of a Web Platform with Artificial Intelligence for Water Quality Monitoring",
  authors: [
    "Vinícius Saraiva Santos",
    "Alan G. Oliveira",
    "Laurindo P. Santos Neto",
    "Fabrício Berton Zanchi",
  ],
  journal: "", // ex.: "Journal of Environmental Informatics"
  year: "", // ex.: "2025"
  doi: "", // ex.: "10.0000/xxxxxx"
  url: "", // link direto da publicação
};

const Publication = () => {
  return (
    <section id="publicacao" className="mx-auto max-w-6xl px-4 py-14">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden />
            Produção científica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h3 className="text-base font-semibold leading-snug sm:text-lg">
              {PUBLICATION.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {PUBLICATION.authors.join("; ")}
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Periódico</dt>
              <dd className="font-medium">
                {PUBLICATION.journal || "Em atualização"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Ano</dt>
              <dd className="font-medium">
                {PUBLICATION.year || "Em atualização"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">DOI</dt>
              <dd className="font-medium break-all">
                {PUBLICATION.doi || "Em atualização"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <Button asChild disabled={!PUBLICATION.url}>
              {PUBLICATION.url ? (
                <a
                  href={PUBLICATION.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                  Acessar publicação
                </a>
              ) : (
                <span>
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                  Acessar publicação
                </span>
              )}
            </Button>
            <Button asChild variant="outline">
              <a href="/about#producao">Ver produção científica do Tikatu</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Publication;
