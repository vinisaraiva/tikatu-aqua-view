import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { ParameterStatus } from "@/data/forumScenarios";

export interface ChartRow {
  code: string;
  name: string;
  avg: number;
  min: number;
  max: number;
  unit: string;
  conamaMax: number | null;
  conamaMin: number | null;
  status: ParameterStatus;
  normalized: number; // % em relação à referência
  count: number;
}

const statusColor: Record<ParameterStatus, string> = {
  "Dentro da faixa adotada": "#10b981",
  "Condição adequada": "#10b981",
  "Requer atenção": "#ef4444",
  "Requer acompanhamento": "#f59e0b",
  "Não avaliado": "#94a3b8",
};

const shortLabel = (name: string) =>
  name
    .replace("Oxigênio dissolvido", "OD")
    .replace("Coliformes termotolerantes", "Coliformes")
    .replace("Fósforo total", "Fósforo")
    .replace("Condutividade", "Cond.")
    .replace("Temperatura", "Temp.");

const ForumChart = ({ rows }: { rows: ChartRow[] }) => {
  if (rows.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Nenhum parâmetro selecionado.
      </div>
    );
  }

  const data = rows.map((r) => ({ ...r, label: shortLabel(r.name) }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            angle={-35}
            textAnchor="end"
            height={60}
            interval={0}
            fontSize={11}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            fontSize={11}
            stroke="hsl(var(--muted-foreground))"
            label={{
              value: "% da referência",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(_v, _name, item: any) => {
              const p = item.payload as ChartRow;
              return [
                `${p.avg} ${p.unit} (média · ${p.count} coleta${p.count === 1 ? "" : "s"})`,
                p.name,
              ];
            }}
          />
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" />
          <Bar dataKey="normalized" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={statusColor[d.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForumChart;
