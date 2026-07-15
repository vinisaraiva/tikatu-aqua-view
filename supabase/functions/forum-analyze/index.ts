import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface RequestPayload {
  dateFrom: string;
  dateTo: string;
  activeParameterCodes: string[];
  points: { id: string; name: string; river: string; environment: string }[];
  readings: {
    pointId: string;
    date: string;
    season: string;
    parameters: {
      code: string;
      name: string;
      value: number;
      unit: string;
      status: string;
      conamaMin: number | null;
      conamaMax: number | null;
    }[];
  }[];
  parameters: {
    code: string;
    name: string;
    unit: string;
    conamaMin: number | null;
    conamaMax: number | null;
    description: string;
  }[];
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPT = `Você é um assistente técnico em português brasileiro especializado em qualidade de água (parâmetros CONAMA). Analise os dados de monitoramento fornecidos e responda EXCLUSIVAMENTE com um JSON válido no formato:
{
  "sintese": "texto único (2-4 frases) descrevendo o cenário observado no período e nos pontos filtrados",
  "atencao": ["lista de parâmetros/pontos que ultrapassaram ou se aproximam dos limites"],
  "recomendacoes": ["ações práticas de acompanhamento, coleta ou verificação"],
  "limitacao": "frase única lembrando que os dados são demonstrativos e não substituem análise laboratorial"
}
Regras: linguagem técnica mas acessível, sem alarmismo, sem citar CONAMA por número de resolução, sem inventar valores não fornecidos. Nunca inclua texto fora do JSON.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);

  let body: RequestPayload;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // Validação básica
  if (
    !Array.isArray(body.readings) ||
    !Array.isArray(body.activeParameterCodes) ||
    !Array.isArray(body.points) ||
    typeof body.dateFrom !== "string" ||
    typeof body.dateTo !== "string"
  ) {
    return jsonResponse({ error: "Payload inválido" }, 400);
  }

  if (body.readings.length === 0) {
    return jsonResponse({ error: "Nenhuma coleta no intervalo." }, 400);
  }
  if (body.readings.length > 40) {
    return jsonResponse({ error: "Máximo de 40 coletas por análise." }, 413);
  }
  if (body.activeParameterCodes.length === 0) {
    return jsonResponse({ error: "Nenhum parâmetro ativo." }, 400);
  }

  // Constrói um resumo compacto para o prompt do usuário
  const pointNames = new Map(body.points.map((p) => [p.id, p.name]));
  const paramNames = new Map(body.parameters.map((p) => [p.code, p]));

  const userPrompt = `Período: ${body.dateFrom} a ${body.dateTo}
Pontos analisados: ${body.points.map((p) => `${p.name} (${p.environment}, ${p.river})`).join("; ")}
Parâmetros ativos: ${body.activeParameterCodes.map((c) => paramNames.get(c)?.name ?? c).join(", ")}

Coletas (${body.readings.length}):
${body.readings
  .map((r) => {
    const pn = pointNames.get(r.pointId) ?? r.pointId;
    const vals = r.parameters
      .map(
        (p) =>
          `${p.name}=${p.value}${p.unit} [${p.status}${
            p.conamaMax != null ? `, ref≤${p.conamaMax}` : ""
          }${p.conamaMin != null ? `, ref≥${p.conamaMin}` : ""}]`,
      )
      .join("; ");
    return `- ${r.date} · ${pn} · ${r.season}: ${vals}`;
  })
  .join("\n")}

Gere a análise em JSON seguindo o formato definido.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Gateway error [${response.status}]: ${text}`);
      if (response.status === 429) {
        return jsonResponse(
          { error: "Muitas requisições. Aguarde alguns instantes e tente novamente." },
          429,
        );
      }
      if (response.status === 402) {
        return jsonResponse(
          { error: "Créditos de IA esgotados. Contate o administrador." },
          402,
        );
      }
      return jsonResponse({ error: "Falha na análise", details: text }, response.status);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return jsonResponse({ error: "Resposta vazia do modelo" }, 502);

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonResponse({ error: "Modelo retornou JSON inválido", raw: content }, 502);
    }

    const p = parsed as Record<string, unknown>;
    const result = {
      sintese: typeof p.sintese === "string" ? p.sintese : "Análise não disponível.",
      atencao: Array.isArray(p.atencao) ? p.atencao.map(String) : [],
      recomendacoes: Array.isArray(p.recomendacoes) ? p.recomendacoes.map(String) : [],
      limitacao:
        typeof p.limitacao === "string"
          ? p.limitacao
          : "Dados demonstrativos. Não substituem análise laboratorial.",
    };

    return jsonResponse(result);
  } catch (e) {
    console.error("forum-analyze error:", e);
    return jsonResponse({ error: (e as Error).message ?? "Erro desconhecido" }, 500);
  }
});
