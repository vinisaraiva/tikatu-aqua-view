
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, DownloadIcon, LoaderIcon, FileTextIcon } from 'lucide-react';

interface ReportSectionProps {
  city: string;
  river: string;
  point: string;
}

const ReportSection = ({ city, river, point }: ReportSectionProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Mock report data
  const mockReport = `
## Relatório de Qualidade da Água

**Local:** ${city} → ${river} → ${point}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Período de Análise:** Últimas 24 horas

### Resumo Executivo

A análise dos dados de qualidade da água coletados no ponto de monitoramento indica variações significativas nos parâmetros físico-químicos durante o período avaliado.

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

### Recomendações

1. Investigar causas do aumento da turbidez no período vespertino
2. Monitorar continuamente os níveis de oxigênio dissolvido
3. Considerar análises adicionais para identificar possíveis fontes de poluição

### Conclusão

O monitoramento indica a necessidade de atenção especial aos parâmetros de turbidez e oxigênio dissolvido. Recomenda-se acompanhamento contínuo e investigação das causas dos desvios identificados.
  `;

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', city, river, point],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockReport;
    },
    enabled: !!(city && river && point),
  });

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple text file for demonstration
    const blob = new Blob([report || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-qualidade-agua-${city}-${river}-${point}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsGeneratingPDF(false);
  };

  if (!city || !river || !point) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma cidade, rio e ponto de coleta para gerar o relatório</p>
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
              {city} → {river} → {point}
            </p>
          </div>
          <Button 
            onClick={handleDownloadPDF}
            disabled={isLoading || isGeneratingPDF}
            className="ml-4"
          >
            {isGeneratingPDF ? (
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
