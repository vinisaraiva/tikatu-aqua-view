
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, DownloadIcon, LoaderIcon, FileTextIcon, PlayIcon } from 'lucide-react';

interface ReportSectionProps {
  city: string;
  river: string;
  points: string[];
}

const ReportSection = ({ city, river, points }: ReportSectionProps) => {
  const [shouldGenerateReport, setShouldGenerateReport] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Mock report data
  const generateMockReport = (selectedPoints: string[]) => {
    return `
## Relatório de Qualidade da Água

**Local:** ${city} → ${river}
**Pontos Analisados:** ${selectedPoints.join(', ')}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Período de Análise:** Últimas 24 horas

### Resumo Executivo

A análise dos dados de qualidade da água coletados nos ${selectedPoints.length} ponto(s) de monitoramento indica variações significativas nos parâmetros físico-químicos durante o período avaliado.

### Pontos de Coleta Analisados

${selectedPoints.map((point, index) => `
**${point}:**
- Coordenadas: -23.${5505 + index * 10}, -46.${6333 + index * 10}
- Status geral: ${index % 3 === 0 ? 'Normal' : index % 3 === 1 ? 'Atenção' : 'Crítico'}
`).join('')}

### Parâmetros Analisados

**pH:**
- Valor médio: 7.1
- Variação: 6.8 - 7.3
- Status: Dentro dos padrões CONAMA
- Observações: Valores estáveis durante o período

**Oxigênio Dissolvido:**
- Valor médio: 5.5 mg/L
- Variação: 4.9 - 6.5 mg/L
- Status: Atenção - valores próximos ao limite
- Observações: Redução significativa durante o período da tarde

**Turbidez:**
- Valor médio: 12.8 NTU
- Variação: 8.2 - 18.7 NTU
- Status: Crítico - valores acima do recomendado
- Observações: Picos de turbidez identificados às 16:00h

**Temperatura:**
- Valor médio: 23.4°C
- Variação: 21.8 - 25.1°C
- Status: Normal
- Observações: Variação típica para o período

### Anomalias Detectadas

1. **Turbidez elevada:** Detectados 3 pontos anômalos entre 12:00 e 20:00h
2. **Oxigênio dissolvido baixo:** Valores críticos registrados às 16:00h
3. **Variações entre pontos:** Diferenças significativas observadas entre os pontos monitorados

### Recomendações

1. Investigar causas do aumento da turbidez no período vespertino
2. Monitorar continuamente os níveis de oxigênio dissolvido
3. Considerar análises adicionais para identificar possíveis fontes de poluição
4. Implementar monitoramento diferenciado para pontos críticos

### Conclusão

O monitoramento nos ${selectedPoints.length} pontos indica a necessidade de atenção especial aos parâmetros de turbidez e oxigênio dissolvido. Recomenda-se acompanhamento contínuo e investigação das causas dos desvios identificados, especialmente considerando as variações entre os diferentes pontos de coleta.
    `;
  };

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', city, river, points],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateMockReport(points);
    },
    enabled: shouldGenerateReport && !!(city && river && points.length > 0),
  });

  const handleGenerateReport = () => {
    setShouldGenerateReport(true);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple text file for demonstration
    const blob = new Blob([report || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-qualidade-agua-${city}-${river}-${points.join('-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsGeneratingPDF(false);
  };

  if (!city || !river || points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma cidade, rio e pelo menos um ponto de coleta para gerar o relatório</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Erro ao gerar o relatório. Tente novamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Relatório de Qualidade da Água</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {city} → {river} → {points.join(', ')}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            {!shouldGenerateReport ? (
              <Button onClick={handleGenerateReport}>
                <PlayIcon className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            ) : (
              <Button 
                onClick={handleDownloadPDF}
                disabled={isLoading || isGeneratingPDF || !report}
                variant={report ? "default" : "secondary"}
              >
                {isGeneratingPDF ? (
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DownloadIcon className="h-4 w-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!shouldGenerateReport ? (
          <div className="text-center py-8 text-gray-500">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="mb-4">Clique no botão "Gerar Relatório" para criar um relatório detalhado dos dados selecionados</p>
            <Button onClick={handleGenerateReport} size="lg">
              <PlayIcon className="h-4 w-4 mr-2" />
              Gerar Relatório Agora
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-gray-600">Gerando relatório...</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {report}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportSection;
