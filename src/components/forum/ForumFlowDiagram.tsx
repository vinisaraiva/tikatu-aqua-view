import { Droplets, Waves, TreePine, Sun, Anchor, Mountain } from "lucide-react";

const STEPS = [
  { label: "Bacia", Icon: Mountain },
  { label: "Rio", Icon: Droplets },
  { label: "Estuário", Icon: Waves },
  { label: "Manguezal", Icon: TreePine },
  { label: "Praia", Icon: Sun },
  { label: "Mar", Icon: Anchor },
];

const ForumFlowDiagram = () => {
  return (
    <div className="w-full">
      <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 px-1 sm:flex-nowrap sm:min-w-max">
        {STEPS.map(({ label, Icon }, i) => (
          <li key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="hidden h-px w-6 bg-border sm:inline-block sm:w-10" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ForumFlowDiagram;
