
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileTextIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useWaterReport } from '@/hooks/useWaterReport';
import { generateReportPdf } from '@/utils/reportPdfGenerator';
import { useState } from 'react';

interface ReadingData {
  pointName: string;
  value: number;
  unit: string;
  conamaMin?: number;
  conamaMax?: number;
  date: string;
}

interface ReportSectionProps {
  city: string;
  river: string;
  points: string[];
  parameters: string[];
  startDate?: Date;
  endDate?: Date;
  readingsData?: ReadingData[];
  selectedParameter?: string;
}

const ReportSection = ({ 
  city, 
  river, 
  points, 
  parameters, 
  startDate, 
  endDate, 
  readingsData = [],
  selectedParameter = ''
}: ReportSectionProps) => {
  const { generateReport, isGenerating } = useWaterReport();
  const [generatedAnalysis, setGeneratedAnalysis] = useState<string | null>(null);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  const handleGenerateReport = async () => {
    if (!selectedParameter || readingsData.length === 0) {
      alert('Selecione um parâmetro e certifique-se de que há dados disponíveis');
      return;
    }

    const reportData = {
      city,
      river,
      points,
      parameter: selectedParameter,
      startDate,
      endDate,
      readings: readingsData,
      language
    };

    const analysis = await generateReport(reportData);
    if (analysis) {
      setGeneratedAnalysis(analysis);
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedAnalysis || readingsData.length === 0) {
      alert('Gere a análise primeiro');
      return;
    }

    try {
      const chartData = readingsData.map(reading => ({
        pointName: reading.pointName,
        value: reading.value,
        unit: reading.unit,
        conamaMin: reading.conamaMin,
        conamaMax: reading.conamaMax
      }));

      await generateReportPdf({
        city,
        river,
        parameter: selectedParameter,
        analysis: generatedAnalysis,
        chartData,
        language,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    }
  };

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
    } else if (startDate) {
      return startDate.toLocaleDateString('pt-BR');
    }
    return 'Período completo';
  };

  const getParametersText = () => {
    if (parameters.length === 0) return 'Todos os parâmetros';
    if (parameters.length <= 3) return parameters.join(', ');
    return `${parameters.slice(0, 3).join(', ')} e mais ${parameters.length - 3}`;
  };

  const hasValidData = city && river && points.length > 0 && selectedParameter && readingsData.length > 0;

  if (!hasValidData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Qualidade da Água</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>
              {!city || !river || points.length === 0 
                ? "Selecione uma cidade, rio e pelo menos um ponto de coleta"
                : !selectedParameter 
                ? "Selecione um parâmetro para análise"
                : "Nenhum dado disponível para os filtros selecionados"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Qualidade da Água</CardTitle>
        <p className="text-sm text-gray-600">
          {city} → {river} → {points.join(', ')} | {getDateRangeText()} | {getParametersText()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Resumo Executivo</h3>
            </div>
            <p className="text-sm text-blue-700">
              Análise geral da qualidade da água nos pontos selecionados
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Dados Técnicos</h3>
            </div>
            <p className="text-sm text-green-700">
              Tabelas detalhadas com todos os parâmetros medidos
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Recomendações</h3>
            </div>
            <p className="text-sm text-orange-700">
              Sugestões para melhoria da qualidade da água
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Configurações do Relatório</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Localização:</strong> {city} - {river}
            </div>
            <div>
              <strong>Pontos:</strong> {points.length} selecionado(s)
            </div>
            <div>
              <strong>Período:</strong> {getDateRangeText()}
            </div>
            <div>
              <strong>Parâmetros:</strong> {getParametersText()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Seletor de idioma */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Idioma do relatório:</label>
            <div className="flex gap-2">
              <Button 
                variant={language === 'pt' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('pt')}
              >
                Português
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <FileTextIcon className="h-4 w-4" />
              )}
              {isGenerating ? 'Gerando Análise...' : 'Gerar Análise com IA'}
            </Button>
            
            {generatedAnalysis && (
              <Button 
                variant="outline" 
                onClick={handleDownloadPdf}
                className="flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>

          {/* Análise gerada */}
          {generatedAnalysis && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold mb-3">Análise Gerada pela IA:</h3>
              <div className="text-sm whitespace-pre-wrap">{generatedAnalysis}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSection;
