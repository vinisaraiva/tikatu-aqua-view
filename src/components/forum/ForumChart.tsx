import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { ScenarioParameter } from "@/data/forumScenarios";

const statusColor: Record<ScenarioParameter["status"], string> = {
  "Dentro da faixa adotada": "#10b981",
  "Condição adequada": "#10b981",
  "Requer atenção": "#f59e0b",
  "Requer acompanhamento": "#0ea5e9",
  "Não avaliado": "#94a3b8",
};

interface Props {
  parameters: ScenarioParameter[];
  parametersAlt?: ScenarioParameter[];
  altLabel?: string;
}

const shortLabel = (name: string) =>
  name.replace(/\s*\(.+?\)\s*/g, "").replace("Oxigênio dissolvido", "OD");

// Normaliza valores para escala 0-100 (percentual relativo ao limite adotado ou ao maior valor)
const normalize = (
  parameters: ScenarioParameter[],
  alt?: ScenarioParameter[],
) => {
  return parameters.map((p, i) => {
    const alt_p = alt?.[i];
    const ref = p.conamaMax ?? (Math.max(p.value, alt_p?.value ?? 0) * 1.2 || 1);
    return {
      name: shortLabel(p.name),
      "Coleta atual": Number(((p.value / ref) * 100).toFixed(1)),
      ...(alt_p
        ? { Alternativa: Number(((alt_p.value / ref) * 100).toFixed(1)) }
        : {}),
      raw: p.value,
      rawAlt: alt_p?.value,
      unit: p.unit,
      status: p.status,
    };
  });
};

const ForumChart = ({ parameters, parametersAlt, altLabel }: Props) => {
  const data = normalize(parameters, parametersAlt);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
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
              value: "% em relação à referência",
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
            formatter={(_v, name, item: any) => {
              if (name === "Coleta atual")
                return [`${item.payload.raw} ${item.payload.unit ?? ""}`, name];
              if (name === "Alternativa" && item.payload.rawAlt != null)
                return [
                  `${item.payload.rawAlt} ${item.payload.unit ?? ""}`,
                  altLabel ?? "Alternativa",
                ];
              return [String(_v), String(name)];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Coleta atual" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={statusColor[(d as any).status as ScenarioParameter["status"]]}
              />
            ))}
          </Bar>
          {parametersAlt && (
            <Bar
              dataKey="Alternativa"
              name={altLabel ?? "Alternativa"}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.55}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForumChart;
