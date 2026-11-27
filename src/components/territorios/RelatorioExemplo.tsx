/**
 * Exemplo de relatório (dados ilustrativos). Mostra a estrutura que a plataforma vai gerar:
 * ponto, período, parâmetros e uma leitura simples da situação. Não é laudo. Exemplo: poço de consumo.
 */
const PARAMETROS = [
  { nome: "pH (acidez)", media: "6,2", faixa: "5,8 · 6,4", ref: "entre 6,0 e 9,0", situacao: "Atenção" },
  { nome: "Sólidos dissolvidos (TDS)", media: "85 mg/L", faixa: "70 · 110", ref: "até 500 mg/L", situacao: "Normal" },
  { nome: "Condutividade", media: "170 µS/cm", faixa: "140 · 220", ref: "sem limite fixo", situacao: "Acompanhar" },
  { nome: "Temperatura", media: "26,1 °C", faixa: "25,4 · 26,9", ref: "sem limite fixo", situacao: "Acompanhar" },
  { nome: "Bactérias (coliformes, E. coli)", media: "não medidas", faixa: "—", ref: "ausência em 100 mL", situacao: "Laboratório" },
] as const;

const COR_SITUACAO: Record<string, string> = {
  Normal: "bg-emerald-100 text-emerald-800",
  Atenção: "bg-amber-100 text-amber-900",
  Acompanhar: "bg-slate-100 text-slate-600",
  Laboratório: "bg-sky-100 text-sky-900",
};

// pH nas 8 coletas. Escala: y = 160 - (v - 5,5) * (160 / 1,5) (5,5 em 160, 7,0 em 0); x = 50 + i * 47.
const PH = [6.4, 6.3, 6.2, 5.9, 5.8, 6.1, 6.3, 6.2];
const LIMITE = 6.0;
const px = (i: number) => 50 + i * 47;
const py = (v: number) => 160 - (v - 5.5) * (160 / 1.5);
const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1 });

export const RelatorioExemplo = () => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-4 text-[#16324a] shadow-xl sm:p-5">
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none whitespace-nowrap text-7xl font-black tracking-widest text-[#0d3a5c]/[0.05]"
    >
      EXEMPLO
    </span>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-[#0d3a5c] pb-3">
      <div>
        <img src="/apresentacao/logo-tikatu.webp" alt="Tikatu" className="h-6 w-auto" />
        <p className="mt-1.5 text-base font-bold text-[#0d3a5c]">Relatório de qualidade da água</p>
      </div>
      <span className="-rotate-2 rounded-md border-2 border-tk-terra px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-tk-terra">
        Exemplo · dados ilustrativos
      </span>
    </div>

    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
      {[
        ["Ponto", "Poço da comunidade (exemplo)"],
        ["Período", "1 a 30 de setembro"],
        ["Coletas", "8 coletas de voluntários"],
        ["Referência", "Portaria GM/MS 888/2021 · água para consumo"],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-tk-creme px-2.5 py-2">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
          <dd className="mt-0.5 font-semibold leading-snug text-[#0d3a5c]">{v}</dd>
        </div>
      ))}
    </dl>

    <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm">
      <p className="font-bold text-amber-900">Situação do mês: atenção ao pH</p>
      <p className="mt-1 leading-snug">
        Os sólidos dissolvidos ficaram dentro da referência. A água ficou um pouco ácida (pH abaixo de 6,0) em 2 das 8
        coletas. Água de poço em solo arenoso costuma ser mais ácida; vale repetir a medida e acompanhar.
      </p>
    </div>

    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-xs tabular-nums">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-500">
            <th className="py-1.5 pr-2 font-bold">Parâmetro</th>
            <th className="py-1.5 pr-2 text-right font-bold">Média</th>
            <th className="py-1.5 pr-2 text-right font-bold">Menor · maior</th>
            <th className="py-1.5 pr-2 font-bold">Referência</th>
            <th className="py-1.5 font-bold">Situação</th>
          </tr>
        </thead>
        <tbody>
          {PARAMETROS.map((p) => (
            <tr key={p.nome} className="border-t border-slate-100">
              <td className="py-1.5 pr-2">{p.nome}</td>
              <td className="py-1.5 pr-2 text-right">{p.media}</td>
              <td className="py-1.5 pr-2 text-right">{p.faixa}</td>
              <td className="py-1.5 pr-2">{p.ref}</td>
              <td className="py-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${COR_SITUACAO[p.situacao]}`}>{p.situacao}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <figure className="mt-3">
      <svg viewBox="0 0 400 190" className="w-full" role="img" aria-label="pH nas 8 coletas, com a linha do mínimo recomendado em 6,0">
        <g fontSize="11" fill="#4a6378">
          {[5.5, 6, 6.5, 7].map((v) => (
            <g key={v}>
              <line x1="40" x2="390" y1={py(v)} y2={py(v)} stroke={v === 5.5 ? "#d5dde5" : "#eef1f4"} />
              <text x="32" y={py(v) + 4} textAnchor="end">
                {fmt(v)}
              </text>
            </g>
          ))}
          <line x1="40" x2="390" y1={py(LIMITE)} y2={py(LIMITE)} stroke="#c4552b" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x="46" y={py(LIMITE) + 15} fill="#c4552b" fontWeight="600">
            mínimo: pH 6,0
          </text>
          <polyline
            points={PH.map((v, i) => `${px(i)},${py(v)}`).join(" ")}
            fill="none"
            stroke="#1b7fc0"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {PH.map((v, i) => (
            <circle key={i} cx={px(i)} cy={py(v)} r="4.5" fill={v < LIMITE ? "#b77806" : "#1b7fc0"} />
          ))}
          <text x={px(0)} y="182" textAnchor="middle">1ª</text>
          <text x={px(7)} y="182" textAnchor="middle">8ª coleta</text>
        </g>
      </svg>
      <figcaption className="text-[11px] text-slate-500">pH em cada coleta. Pontos laranja: abaixo de 6,0.</figcaption>
    </figure>

    <div className="mt-3 rounded-xl bg-[#0d3a5c] p-3 text-xs leading-snug text-tk-nevoa">
      <p className="text-sm font-bold text-tk-terra-clara">Este relatório não é um laudo</p>
      <p className="mt-1">
        Mostra dados de monitoramento participativo. A sonda não mede bactérias: para saber se a água é segura para
        beber, peça análise de laboratório à saúde indígena (SESAI) ou à Vigilância Sanitária. O relatório pode
        subsidiar esse pedido.
      </p>
    </div>
  </div>
);
