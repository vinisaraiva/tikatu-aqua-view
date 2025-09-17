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
    parameterCode?: string;
    parameterDescription?: string;
  }>;
  language: 'pt' | 'en';
  analysisType?: string;
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
  const { city, river, points, parameter, readings, startDate, endDate, analysisType } = data;
  
  if (readings.length === 0) {
    return data.language === 'pt' 
      ? "Não há dados disponíveis para o período e filtros selecionados."
      : "No data available for the selected period and filters.";
  }

  const isPointAnalysis = analysisType === 'by-point';
  
  if (isPointAnalysis) {
    return createPointAnalysisContext(data);
  } else {
    return createParameterAnalysisContext(data);
  }
}

function createPointAnalysisContext(data: ReportData): string {
  const { city, river, points, readings, startDate, endDate } = data;
  
  // Agrupar dados por ponto e parâmetro
  const pointsData: Record<string, Record<string, any[]>> = {};
  const allParameters = new Set<string>();
  
  readings.forEach(reading => {
    if (!pointsData[reading.pointName]) {
      pointsData[reading.pointName] = {};
    }
    
    const paramKey = reading.parameterCode || reading.parameterDescription || 'Parâmetro';
    allParameters.add(paramKey);
    
    if (!pointsData[reading.pointName][paramKey]) {
      pointsData[reading.pointName][paramKey] = [];
    }
    
    pointsData[reading.pointName][paramKey].push(reading);
  });

  if (data.language === 'pt') {
    let context = `
TIPO DE ANÁLISE: Análise Completa por Ponto de Coleta

DADOS DA COLETA:
- Localização: ${city} - ${river}
- Pontos de coleta: ${points.join(', ')}
- Parâmetros analisados: ${Array.from(allParameters).join(', ')}
- Período: ${startDate && endDate ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}` : 'Período completo'}

DADOS POR PONTO DE COLETA:
`;

    Object.entries(pointsData).forEach(([pointName, parameters]) => {
      context += `\n📍 PONTO ${pointName}:\n`;
      
      Object.entries(parameters).forEach(([paramKey, paramReadings]) => {
        const values = paramReadings.map(r => r.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        
        const firstReading = paramReadings[0];
        const unit = firstReading.unit;
        const conamaMin = firstReading.conamaMin;
        const conamaMax = firstReading.conamaMax;
        const description = firstReading.parameterDescription || paramKey;
        
        // Status de conformidade
        let conformityStatus = 'Dentro dos padrões';
        if (conamaMin !== undefined && avgValue < conamaMin) conformityStatus = 'Abaixo do mínimo';
        if (conamaMax !== undefined && avgValue > conamaMax) conformityStatus = 'Acima do máximo';
        
        context += `
  • ${description} (${paramKey}):
    - Valores: ${values.map(v => `${v.toFixed(2)} ${unit}`).join(', ')}
    - Média: ${avgValue.toFixed(2)} ${unit}
    - Amplitude: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)} ${unit}
    - Limites CONAMA: ${conamaMin !== undefined ? `${conamaMin}` : 'N/D'} - ${conamaMax !== undefined ? `${conamaMax}` : 'N/D'} ${unit}
    - Status: ${conformityStatus}
`;
      });
    });

    return context;
  } else {
    let context = `
ANALYSIS TYPE: Complete Analysis by Collection Point

COLLECTION DATA:
- Location: ${city} - ${river}
- Collection points: ${points.join(', ')}
- Parameters analyzed: ${Array.from(allParameters).join(', ')}
- Period: ${startDate && endDate ? `${new Date(startDate).toLocaleDateString('en-US')} to ${new Date(endDate).toLocaleDateString('en-US')}` : 'Complete period'}

DATA BY COLLECTION POINT:
`;

    Object.entries(pointsData).forEach(([pointName, parameters]) => {
      context += `\n📍 POINT ${pointName}:\n`;
      
      Object.entries(parameters).forEach(([paramKey, paramReadings]) => {
        const values = paramReadings.map(r => r.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        
        const firstReading = paramReadings[0];
        const unit = firstReading.unit;
        const conamaMin = firstReading.conamaMin;
        const conamaMax = firstReading.conamaMax;
        const description = firstReading.parameterDescription || paramKey;
        
        // Conformity status
        let conformityStatus = 'Within standards';
        if (conamaMin !== undefined && avgValue < conamaMin) conformityStatus = 'Below minimum';
        if (conamaMax !== undefined && avgValue > conamaMax) conformityStatus = 'Above maximum';
        
        context += `
  • ${description} (${paramKey}):
    - Values: ${values.map(v => `${v.toFixed(2)} ${unit}`).join(', ')}
    - Average: ${avgValue.toFixed(2)} ${unit}
    - Range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)} ${unit}
    - CONAMA Limits: ${conamaMin !== undefined ? `${conamaMin}` : 'N/A'} - ${conamaMax !== undefined ? `${conamaMax}` : 'N/A'} ${unit}
    - Status: ${conformityStatus}
`;
      });
    });

    return context;
  }
}

function createParameterAnalysisContext(data: ReportData): string {
  const { city, river, points, parameter, readings, startDate, endDate } = data;
  
  const values = readings.map(r => r.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  
  const unit = readings[0]?.unit || '';
  const conamaMin = readings[0]?.conamaMin;
  const conamaMax = readings[0]?.conamaMax;
  
  if (data.language === 'pt') {
    return `
TIPO DE ANÁLISE: Análise por Parâmetro

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
    return `
ANALYSIS TYPE: Analysis by Parameter

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
}

function createReportPrompt(data: ReportData, context: string): string {
  const isPointAnalysis = data.analysisType === 'by-point';
  
  if (data.language === 'pt') {
    if (isPointAnalysis) {
      return `
Atue como um analista ambiental especialista em monitoramento da qualidade da água. Escreva um relatório estruturado e claro baseado nos dados fornecidos. Seu objetivo é usar linguagem técnica, mas acessível ao público geral. Evite jargões acadêmicos, explique termos quando necessário, e escreva com fluência e clareza. Siga o estilo usado em relatórios oficiais do governo.

INSTRUÇÕES ESPECÍFICAS PARA ANÁLISE POR PONTO DE COLETA:
- Esta é uma análise completa por ponto de coleta, considerando múltiplos parâmetros
- Foque na análise integrada da qualidade da água em cada ponto
- Compare a qualidade entre os diferentes pontos de coleta
- Avalie o conjunto de parâmetros para determinar a qualidade geral da água

${context}

DEFINIÇÕES DOS PARÂMETROS (use apenas os parâmetros presentes nos dados):
- **pH**: Mede a acidez ou alcalinidade da água (escala 0-14). Valores ideais estão entre 6-9.
- **DBO (Demanda Bioquímica de Oxigênio)**: Indica a quantidade de oxigênio necessária para decompor matéria orgânica. Valores altos indicam poluição.
- **OD (Oxigênio Dissolvido)**: Oxigênio disponível na água para a vida aquática. Essencial para peixes e organismos.
- **Turbidez**: Mede a clareza da água. Valores altos indicam presença de partículas em suspensão.
- **TDS (Sólidos Dissolvidos Totais)**: Quantidade total de substâncias dissolvidas na água.
- **Coliformes**: Indicadores de contaminação bacteriana e possível presença de patógenos.
- **Temperatura**: Afeta processos químicos e biológicos na água.
- **Condutividade**: Mede a capacidade da água conduzir eletricidade, relacionada aos sais dissolvidos.

Organize o relatório usando a seguinte estrutura:

1. **Contexto da Amostragem e Referência Normativa**: Descreva brevemente o contexto da coleta das amostras e a base legal para avaliação (CONAMA).

2. **Parâmetros Analisados**: Explique APENAS os parâmetros que estão presentes nos dados, por que são importantes para a qualidade da água e como se relacionam entre si.

3. **Análise por Ponto de Coleta**: Para cada ponto, analise o conjunto de parâmetros encontrados, destacando:
   - Valores que estão dentro ou fora dos padrões CONAMA
   - Relação entre os diferentes parâmetros no mesmo ponto
   - Qualidade geral da água nesse ponto

4. **Comparação Entre Pontos**: Compare os pontos de coleta, identificando qual apresenta melhor/pior qualidade e por quê.

5. **Possíveis Causas**: Indique possíveis causas para valores fora da faixa, considerando o conjunto de parâmetros.

6. **Recomendações**: Sugira ações específicas para cada ponto, baseadas nos parâmetros analisados.

O relatório deve ser escrito em português do brasil, livre de redundâncias e repetições, estruturado e se for necessário pode juntar alguns tópicos. O texto deve ser formatado como parágrafos naturais, apenas os títulos e subtítulos devem estar em negrito, e você não deve em momento algum usar asteriscos, hashtags ou símbolos especiais para marcar títulos ou seções.
      `;
    } else {
      return `
Atue como um analista ambiental especialista em monitoramento da qualidade da água. Escreva um relatório estruturado e claro baseado nos dados fornecidos. Seu objetivo é usar linguagem técnica, mas acessível ao público geral. Evite jargões acadêmicos, explique termos quando necessário, e escreva com fluência e clareza. Siga o estilo usado em relatórios oficiais do governo.

INSTRUÇÕES ESPECÍFICAS PARA ANÁLISE POR PARÂMETRO:
- Esta é uma análise focada em um parâmetro específico
- Concentre-se na análise detalhada deste parâmetro
- Compare os valores entre os diferentes pontos de coleta

${context}

Organize o relatório usando a seguinte estrutura:

1. **Contexto da Amostragem e Referência Normativa**: Descreva brevemente o contexto da coleta das amostras e a base legal para avaliação.

2. **Entendimento do Parâmetro**: Explique o que é o parâmetro e por que é importante para a qualidade da água. Use linguagem simples.

3. **Análise dos Dados e Comparação**: Analise os valores coletados, compare com a faixa recomendada e destaque se estão dentro, acima ou abaixo dos limites esperados. Mencione variações entre os pontos de amostragem.

4. **Possíveis Causas**: Se algum valor estiver fora da faixa, indique possíveis causas como variação natural ou atividade humana.

5. **Recomendações**: Sugira ações que poderiam ser tomadas, se necessário, para mitigar riscos ou manter a qualidade da água.

O relatório deve ser escrito em português do brasil, livre de redundâncias e repetições, estruturado e se for necessário pode juntar alguns tópicos. O texto deve ser formatado como parágrafos naturais, apenas os títulos e subtítulos devem estar em negrito, e você não deve em momento algum usar asteriscos, hashtags ou símbolos especiais para marcar títulos ou seções.
      `;
    }
  } else {
    if (isPointAnalysis) {
      return `
Act as an environmental analyst with expertise in water quality monitoring. Write a structured and clear report based on the data provided. Your goal is to use technical language, but make it accessible to a general audience. Avoid academic jargon, explain terms when needed, and write with fluency and clarity. Follow the style used in official government reports.

SPECIFIC INSTRUCTIONS FOR COLLECTION POINT ANALYSIS:
- This is a complete analysis by collection point, considering multiple parameters
- Focus on the integrated analysis of water quality at each point
- Compare quality between different collection points
- Evaluate the set of parameters to determine overall water quality

${context}

PARAMETER DEFINITIONS (use only parameters present in the data):
- **pH**: Measures water acidity or alkalinity (0-14 scale). Ideal values are between 6-9.
- **BOD (Biochemical Oxygen Demand)**: Indicates oxygen needed to decompose organic matter. High values indicate pollution.
- **DO (Dissolved Oxygen)**: Oxygen available in water for aquatic life. Essential for fish and organisms.
- **Turbidity**: Measures water clarity. High values indicate suspended particles.
- **TDS (Total Dissolved Solids)**: Total amount of substances dissolved in water.
- **Coliforms**: Indicators of bacterial contamination and possible pathogen presence.
- **Temperature**: Affects chemical and biological processes in water.
- **Conductivity**: Measures water's ability to conduct electricity, related to dissolved salts.

Organize the report using the following structure:

1. **Sampling Context and Regulatory Reference**: Briefly describe the context of sample collection and the legal basis for evaluation (CONAMA).

2. **Parameters Analyzed**: Explain ONLY the parameters present in the data, why they are important for water quality and how they relate to each other.

3. **Analysis by Collection Point**: For each point, analyze the set of parameters found, highlighting:
   - Values that are within or outside CONAMA standards
   - Relationship between different parameters at the same point
   - Overall water quality at that point

4. **Comparison Between Points**: Compare collection points, identifying which shows better/worse quality and why.

5. **Possible Causes**: Indicate possible causes for values outside the range, considering the set of parameters.

6. **Recommendations**: Suggest specific actions for each point, based on the analyzed parameters.

The report must be written in English, free of redundancies and repetitions, structured and if necessary you can join some topics. The text should be formatted as natural paragraphs, only the titles and subtitles should be in bold, and you should not at any time use asterisks, hashes or special symbols to mark titles or sections.
      `;
    } else {
      return `
Act as an environmental analyst with expertise in water quality monitoring. Write a structured and clear report based on the data provided. Your goal is to use technical language, but make it accessible to a general audience. Avoid academic jargon, explain terms when needed, and write with fluency and clarity. Follow the style used in official government reports.

SPECIFIC INSTRUCTIONS FOR PARAMETER ANALYSIS:
- This is an analysis focused on a specific parameter
- Concentrate on the detailed analysis of this parameter
- Compare values between different collection points

${context}

Organize the report using the following structure:

1. **Sampling Context and Regulatory Reference**: Briefly describe the context of sample collection and the legal basis for evaluation.

2. **Understanding the Parameter**: Explain what the parameter is and why it is important for water quality. Use plain language.

3. **Data Analysis and Comparison**: Analyze the values collected, compare with the recommended range, and highlight whether they are within, above, or below the expected thresholds. Mention variations among sampling points.

4. **Possible Causes**: If any value is outside the range, indicate possible causes such as natural variation or human activity.

5. **Recommendations**: Suggest actions that could be taken, if necessary, to mitigate risks or maintain water quality.

The report must be written in English, free of redundancies and repetitions, structured and if necessary you can join some topics. The text should be formatted as natural paragraphs, only the titles and subtitles should be in bold, and you should not at any time use asteriscos, hashes or special symbols to mark titles or sections.
      `;
    }
  }
}