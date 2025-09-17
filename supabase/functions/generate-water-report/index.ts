import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ReportData {
  city: string;
  river: string;
  points: string[];
  parameter: string;
  startDate?: string;
  endDate?: string;
  readings: Array<{
    pointName: string;
    value: number;
    unit: string;
    conamaMin?: number;
    conamaMax?: number;
    date: string;
  }>;
  language: 'pt' | 'en';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReportData = await req.json();
    console.log('Generating report for:', data);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Criar contexto dos dados
    const context = createDataContext(data);
    
    // Criar prompt estruturado
    const prompt = createReportPrompt(data, context);

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(JSON.stringify({ 
      analysis,
      context: context
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-water-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createDataContext(data: ReportData): string {
  const { city, river, points, parameter, readings, startDate, endDate } = data;
  
  if (readings.length === 0) {
    return data.language === 'pt' 
      ? "Não há dados disponíveis para o período e filtros selecionados."
      : "No data available for the selected period and filters.";
  }

  const values = readings.map(r => r.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  
  const unit = readings[0]?.unit || '';
  const conamaMin = readings[0]?.conamaMin;
  const conamaMax = readings[0]?.conamaMax;
  
  let context = '';
  
  if (data.language === 'pt') {
    context = `
DADOS DA COLETA:
- Localização: ${city} - ${river}
- Pontos de coleta: ${points.join(', ')}
- Parâmetro analisado: ${parameter}
- Período: ${startDate && endDate ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}` : 'Período completo'}
- Unidade: ${unit}

VALORES COLETADOS:
${readings.map(r => `- ${r.pointName}: ${r.value.toFixed(2)} ${unit} (${r.date})`).join('\n')}

ESTATÍSTICAS:
- Valor mínimo: ${minValue.toFixed(2)} ${unit}
- Valor máximo: ${maxValue.toFixed(2)} ${unit}
- Valor médio: ${avgValue.toFixed(2)} ${unit}

REFERÊNCIAS CONAMA:
${conamaMin !== undefined ? `- Limite mínimo: ${conamaMin} ${unit}` : '- Limite mínimo: Não definido'}
${conamaMax !== undefined ? `- Limite máximo: ${conamaMax} ${unit}` : '- Limite máximo: Não definido'}

CONFORMIDADE:
${readings.map(r => {
  let status = 'Dentro dos padrões';
  if (conamaMin !== undefined && r.value < conamaMin) status = 'Abaixo do mínimo';
  if (conamaMax !== undefined && r.value > conamaMax) status = 'Acima do máximo';
  return `- ${r.pointName}: ${status}`;
}).join('\n')}
    `;
  } else {
    context = `
COLLECTION DATA:
- Location: ${city} - ${river}
- Collection points: ${points.join(', ')}
- Parameter analyzed: ${parameter}
- Period: ${startDate && endDate ? `${new Date(startDate).toLocaleDateString('en-US')} to ${new Date(endDate).toLocaleDateString('en-US')}` : 'Complete period'}
- Unit: ${unit}

COLLECTED VALUES:
${readings.map(r => `- ${r.pointName}: ${r.value.toFixed(2)} ${unit} (${r.date})`).join('\n')}

STATISTICS:
- Minimum value: ${minValue.toFixed(2)} ${unit}
- Maximum value: ${maxValue.toFixed(2)} ${unit}
- Average value: ${avgValue.toFixed(2)} ${unit}

CONAMA REFERENCES:
${conamaMin !== undefined ? `- Minimum limit: ${conamaMin} ${unit}` : '- Minimum limit: Not defined'}
${conamaMax !== undefined ? `- Maximum limit: ${conamaMax} ${unit}` : '- Maximum limit: Not defined'}

COMPLIANCE:
${readings.map(r => {
  let status = 'Within standards';
  if (conamaMin !== undefined && r.value < conamaMin) status = 'Below minimum';
  if (conamaMax !== undefined && r.value > conamaMax) status = 'Above maximum';
  return `- ${r.pointName}: ${status}`;
}).join('\n')}
    `;
  }
  
  return context;
}

function createReportPrompt(data: ReportData, context: string): string {
  if (data.language === 'pt') {
    return `
Atue como um analista ambiental especialista em monitoramento da qualidade da água. Escreva um relatório estruturado e claro baseado nos dados fornecidos. Seu objetivo é usar linguagem técnica, mas acessível ao público geral. Evite jargões acadêmicos, explique termos quando necessário, e escreva com fluência e clareza. Siga o estilo usado em relatórios oficiais do governo.

${context}

Organize o relatório usando a seguinte estrutura:

1. **Contexto da Amostragem e Referência Normativa**: Descreva brevemente o contexto da coleta das amostras e a base legal para avaliação.

2. **Entendimento do Parâmetro**: Explique o que é o parâmetro e por que é importante para a qualidade da água. Use linguagem simples.

3. **Análise dos Dados e Comparação**: Analise os valores coletados, compare com a faixa recomendada e destaque se estão dentro, acima ou abaixo dos limites esperados. Mencione variações entre os pontos de amostragem.

4. **Possíveis Causas**: Se algum valor estiver fora da faixa, indique possíveis causas como variação natural ou atividade humana.

5. **Recomendações**: Sugira ações que poderiam ser tomadas, se necessário, para mitigar riscos ou manter a qualidade da água.

O relatório deve ser escrito em português do brasil, livre de redundâncias e repetições, estruturado e se for necessário pode juntar alguns tópicos. O texto deve ser formatado como parágrafos naturais, apenas os títulos e subtítulos devem estar em negrito, e você não deve em momento algum usar asteriscos, hashtags ou símbolos especiais para marcar títulos ou seções.
    `;
  } else {
    return `
Act as an environmental analyst with expertise in water quality monitoring. Write a structured and clear report based on the data provided. Your goal is to use technical language, but make it accessible to a general audience. Avoid academic jargon, explain terms when needed, and write with fluency and clarity. Follow the style used in official government reports.

${context}

Organize the report using the following structure:

1. **Sampling Context and Regulatory Reference**: Briefly describe the context of sample collection and the legal basis for evaluation.

2. **Understanding the Parameter**: Explain what the parameter is and why it is important for water quality. Use plain language.

3. **Data Analysis and Comparison**: Analyze the values collected, compare with the recommended range, and highlight whether they are within, above, or below the expected thresholds. Mention variations among sampling points.

4. **Possible Causes**: If any value is outside the range, indicate possible causes such as natural variation or human activity.

5. **Recommendations**: Suggest actions that could be taken, if necessary, to mitigate risks or maintain water quality.

The report must be written in English, free of redundancies and repetitions, structured and if necessary you can join some topics. The text should be formatted as natural paragraphs, only the titles and subtitles should be in bold, and you should not at any time use asterisks, hashes or special symbols to mark titles or sections.
    `;
  }
}