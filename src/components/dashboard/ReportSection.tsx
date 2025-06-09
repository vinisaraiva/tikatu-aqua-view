
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileTextIcon, AlertCircleIcon } from 'lucide-react';

interface ReportSectionProps {
  city: string;
  river: string;
  points: string[];
  parameters: string[];
  startDate?: Date;
  endDate?: Date;
}

const ReportSection = ({ city, river, points, parameters, startDate, endDate }: ReportSectionProps) => {
  const generateReport = () => {
    // Mock report generation
    console.log('Generating report with filters:', {
      city,
      river,
      points,
      parameters,
      startDate,
      endDate
    });
    
    // In a real app, this would generate and download a PDF/Excel report
    alert('Relatório gerado com sucesso!');
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

  if (!city || !river || points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma cidade, rio e pelo menos um ponto de coleta para gerar o relatório</p>
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

        <div className="flex gap-4">
          <Button onClick={generateReport} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Gerar Relatório PDF
          </Button>
          <Button variant="outline" onClick={generateReport} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSection;
