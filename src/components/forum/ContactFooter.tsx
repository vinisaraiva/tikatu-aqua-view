import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Copy, Share2, ExternalLink, Mail, Globe } from "lucide-react";
import { toast } from "sonner";

const ContactFooter = () => {
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: "Tikatu no Fórum de Economia do Mar",
      text: "Demonstração interativa do Tikatu — monitoramento da qualidade da água.",
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // usuário cancelou ou navegador bloqueou — cai no fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  return (
    <section id="contato" className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Contato e acesso à plataforma
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Conheça a plataforma completa e acompanhe o desenvolvimento do
              projeto.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" aria-hidden />
                <a
                  href="https://www.tikatu.com.br"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline-offset-4 hover:underline"
                >
                  www.tikatu.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" aria-hidden />
                <a
                  href="mailto:contato@tikatu.com.br"
                  className="underline-offset-4 hover:underline"
                >
                  contato@tikatu.com.br
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                Acessar o Tikatu
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Conhecer o projeto</Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" aria-hidden />
                Compartilhar
              </Button>
              <Button
                variant="ghost"
                aria-label="Copiar link"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tikatu · Demonstração baseada na plataforma.
        </p>
      </div>
    </section>
  );
};

export default ContactFooter;
