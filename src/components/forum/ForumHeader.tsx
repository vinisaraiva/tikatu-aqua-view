import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ForumHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png"
            alt="Tikatu"
            className="h-12 w-auto sm:h-10"
          />
          <span className="hidden text-sm font-medium text-muted-foreground md:inline">
            Fórum de Economia do Mar
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/">Conheça o Tikatu</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default ForumHeader;
