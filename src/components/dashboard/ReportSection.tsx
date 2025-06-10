
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, FileTextIcon, AlertCircleIcon } from 'lucide-react';
import jsPDF from 'jspdf';

interface ReportSectionProps {
  city: string;
  river: string;
  points: string[];
  parameters: string[];
  startDate?: Date;
  endDate?: Date;
}

const ReportSection = ({ city, river, points, parameters, startDate, endDate }: ReportSectionProps) => {
  const generatePdfReport = () => {
    console.log('Generating PDF report with filters:', {
      city,
      river,
      points,
      parameters,
      startDate,
      endDate
    });

    try {
      const doc = new jsPDF();
      
      // Título do relatório
      doc.setFontSize(20);
      doc.text('Relatório de Qualidade da Água', 20, 30);
      
      // Informações básicas
      doc.setFontSize(12);
      doc.text(`Cidade: ${city}`, 20, 50);
      doc.text(`Rio: ${river}`, 20, 60);
      doc.text(`Pontos de Coleta: ${points.join(', ')}`, 20, 70);
      
      const dateRangeText = getDateRangeText();
      doc.text(`Período: ${dateRangeText}`, 20, 80);
      
      const parametersText = getParametersText();
      doc.text(`Parâmetros: ${parametersText}`, 20, 90);
      
      // Seções do relatório
      doc.setFontSize(14);
      doc.text('Resumo Executivo', 20, 110);
      doc.setFontSize(10);
      doc.text('Análise geral da qualidade da água nos pontos selecionados.', 20, 120);
      doc.text('Este relatório apresenta os dados coletados e uma avaliação', 20, 130);
      doc.text('da qualidade da água baseada nos parâmetros monitorados.', 20, 140);
      
      doc.setFontSize(14);
      doc.text('Dados Técnicos', 20, 160);
      doc.setFontSize(10);
      doc.text('Tabelas detalhadas com todos os parâmetros medidos:', 20, 170);
      doc.text('- pH, Turbidez, Oxigênio Dissolvido', 20, 180);
      doc.text('- Temperatura, Coliformes Fecais', 20, 190);
      doc.text('- DBO, Fósforo Total, Nitrogênio Total', 20, 200);
      
      doc.setFontSize(14);
      doc.text('Recomendações', 20, 220);
      doc.setFontSize(10);
      doc.text('Sugestões para melhoria da qualidade da água:', 20, 230);
      doc.text('- Monitoramento contínuo dos parâmetros críticos', 20, 240);
      doc.text('- Implementação de medidas de controle de poluição', 20, 250);
      doc.text('- Educação ambiental da comunidade local', 20, 260);
      
      // Rodapé
      doc.setFontSize(8);
      doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
      
      // Salvar o PDF
      const fileName = `relatorio-agua-${city}-${river}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    }
  };

  const generateExcelReport = () => {
    console.log('Generating Excel report with filters:', {
      city,
      river,
      points,
      parameters,
      startDate,
      endDate
    });
    
    // Simular geração do Excel por enquanto
    alert('Funcionalidade de Excel será implementada em breve!');
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
          <Button onClick={generatePdfReport} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Gerar Relatório PDF
          </Button>
          <Button variant="outline" onClick={generateExcelReport} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSection;
