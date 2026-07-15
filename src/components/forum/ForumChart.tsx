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

export interface ChartDatum {
  label: string;
  sublabel?: string;
  value: number;
  status: ParameterStatus;
}

interface Props {
  data: ChartDatum[];
  parameterName: string;
  unit: string;
  conamaMin: number | null;
  conamaMax: number | null;
}

const statusColor: Record<ParameterStatus, string> = {
  "Dentro da faixa adotada": "#22c55e",
  "Condição adequada": "#22c55e",
  "Requer atenção": "#ef4444",
  "Requer acompanhamento": "#f59e0b",
  "Não avaliado": "#94a3b8",
};

const CustomTooltip = ({ active, payload, unit }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ChartDatum;
  return (
    <div className="rounded-md border border-border bg-card p-2 text-xs shadow-sm">
      <div className="font-medium text-foreground">{p.label}</div>
      {p.sublabel && <div className="text-muted-foreground">{p.sublabel}</div>}
      <div className="mt-1">
        <span className="tabular-nums font-semibold text-foreground">{p.value}</span>{" "}
        <span className="text-muted-foreground">{unit}</span>
      </div>
      <div className="text-muted-foreground">{p.status}</div>
    </div>
  );
};

const ForumChart = ({ data, parameterName, unit, conamaMin, conamaMax }: Props) => {
  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Sem dados para este parâmetro.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legenda dos limites */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {conamaMin != null && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-emerald-500" />
            Mínimo CONAMA: {conamaMin} {unit}
          </span>
        )}
        {conamaMax != null && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-orange-500" />
            Máximo CONAMA: {conamaMax} {unit}
          </span>
        )}
        {conamaMin == null && conamaMax == null && (
          <span>Sem limite CONAMA para este parâmetro.</span>
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              angle={-35}
              textAnchor="end"
              height={70}
              interval={0}
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
              label={{
                value: unit || parameterName,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
              }}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={statusColor[d.status]} />
              ))}
            </Bar>
            {conamaMin != null && (
              <ReferenceLine
                y={conamaMin}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 4"
                ifOverflow="extendDomain"
              />
            )}
            {conamaMax != null && (
              <ReferenceLine
                y={conamaMax}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="6 4"
                ifOverflow="extendDomain"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForumChart;
