import { definirIdioma, useIdioma } from "./idioma";

/** Botões PT-BR | EN. `claro` para fundo creme (abertura). */
export const BotaoIdioma = ({ claro = false, className = "" }: { claro?: boolean; className?: string }) => {
  const l = useIdioma();
  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={`inline-flex items-center rounded-full p-0.5 text-xs font-semibold ${
        claro ? "border border-[#0d3a5c]/20 bg-white/80 shadow-sm backdrop-blur" : "border border-white/10"
      } ${className}`}
    >
      {(["pt", "en"] as const).map((x) => {
        const on = l === x;
        return (
          <button
            key={x}
            type="button"
            lang={x === "pt" ? "pt-BR" : "en"}
            onClick={() => definirIdioma(x)}
            aria-pressed={on}
            title={x === "pt" ? "Português (Brasil)" : "English"}
            className={`rounded-full px-3 py-1 transition-colors ${
              on
                ? claro
                  ? "bg-[#0d3a5c] text-tk-creme"
                  : "bg-tk-rio-claro text-tk-marinho"
                : claro
                  ? "text-[#0d3a5c]/70 hover:text-[#0d3a5c]"
                  : "text-tk-nevoa/75 hover:text-tk-creme"
            }`}
          >
            {x === "pt" ? "PT-BR" : "EN"}
          </button>
        );
      })}
    </div>
  );
};
