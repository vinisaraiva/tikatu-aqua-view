import { useT, type Bi } from "./idioma";

/** Selo de situação: o que está publicado, disponível, em andamento ou em desenvolvimento. */
export type TipoSituacao = "publicado" | "disponivel" | "andamento" | "desenvolvimento";

const ROTULO: Record<TipoSituacao, Bi> = {
  publicado: ["Publicado", "Published"],
  disponivel: ["Disponível", "Available"],
  andamento: ["Em andamento", "In progress"],
  desenvolvimento: ["Em desenvolvimento", "In development"],
};

const COR: Record<TipoSituacao, string> = {
  publicado: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  disponivel: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  andamento: "border-[#efb08c]/40 bg-[#efb08c]/10 text-[#f6c9ad]",
  desenvolvimento: "border-[#efb08c]/40 bg-[#efb08c]/10 text-[#f6c9ad]",
};

export const Situacao = ({ tipo }: { tipo: TipoSituacao }) => {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${COR[tipo]}`}
    >
      {t(ROTULO[tipo])}
    </span>
  );
};
