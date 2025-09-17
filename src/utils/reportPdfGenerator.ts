import jsPDF from 'jspdf';

interface ChartData {
  pointName: string;
  value: number;
  unit: string;
  conamaMin?: number;
  conamaMax?: number;
}

interface ReportPdfData {
  city: string;
  river: string;
  parameter: string;
  analysis: string;
  chartData: ChartData[];
  language: 'pt' | 'en';
  startDate?: Date;
  endDate?: Date;
}

export async function generateReportPdf(data: ReportPdfData): Promise<void> {
  const { city, river, parameter, analysis, chartData, language, startDate, endDate } = data;
  
  try {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = language === 'pt' 
      ? 'Relatório de Análise da Qualidade da Água'
      : 'Water Quality Analysis Report';
    doc.text(title, margin, 30);
    
    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
    const dateLabel = language === 'pt' ? 'Data: ' : 'Date: ';
    doc.text(`${dateLabel}${currentDate}`, pageWidth - 60, 30);
    
    // Informações básicas
    let yPosition = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const infoTitle = language === 'pt' ? 'Informações da Coleta' : 'Collection Information';
    doc.text(infoTitle, margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const cityLabel = language === 'pt' ? 'Cidade: ' : 'City: ';
    doc.text(`${cityLabel}${city}`, margin, yPosition);
    yPosition += lineHeight;
    
    const riverLabel = language === 'pt' ? 'Rio: ' : 'River: ';
    doc.text(`${riverLabel}${river}`, margin, yPosition);
    yPosition += lineHeight;
    
    const paramLabel = language === 'pt' ? 'Parâmetro: ' : 'Parameter: ';
    doc.text(`${paramLabel}${parameter}`, margin, yPosition);
    yPosition += lineHeight;
    
    if (startDate && endDate) {
      const periodLabel = language === 'pt' ? 'Período: ' : 'Period: ';
      const dateFormat = language === 'pt' ? 'pt-BR' : 'en-US';
      const period = `${startDate.toLocaleDateString(dateFormat)} - ${endDate.toLocaleDateString(dateFormat)}`;
      doc.text(`${periodLabel}${period}`, margin, yPosition);
      yPosition += lineHeight;
    }
    
    // Gráfico simples de barras (usando texto)
    if (chartData.length > 0) {
      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const chartTitle = language === 'pt' ? 'Dados dos Pontos de Coleta' : 'Collection Points Data';
      doc.text(chartTitle, margin, yPosition);
      
      yPosition += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const unit = chartData[0]?.unit || '';
      chartData.forEach((point) => {
        doc.text(`${point.pointName}: ${point.value.toFixed(2)} ${unit}`, margin, yPosition);
        yPosition += lineHeight;
      });
      
      // Referências CONAMA
      if (chartData[0]?.conamaMin !== undefined || chartData[0]?.conamaMax !== undefined) {
        yPosition += 5;
        const conamaTitle = language === 'pt' ? 'Referências CONAMA:' : 'CONAMA References:';
        doc.setFont('helvetica', 'bold');
        doc.text(conamaTitle, margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        if (chartData[0]?.conamaMin !== undefined) {
          const minLabel = language === 'pt' ? 'Mínimo: ' : 'Minimum: ';
          doc.text(`${minLabel}${chartData[0].conamaMin} ${unit}`, margin, yPosition);
          yPosition += lineHeight;
        }
        if (chartData[0]?.conamaMax !== undefined) {
          const maxLabel = language === 'pt' ? 'Máximo: ' : 'Maximum: ';
          doc.text(`${maxLabel}${chartData[0].conamaMax} ${unit}`, margin, yPosition);
          yPosition += lineHeight;
        }
      }
    }
    
    // Análise (nova página se necessário)
    yPosition += 15;
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const analysisTitle = language === 'pt' ? 'Análise Técnica' : 'Technical Analysis';
    doc.text(analysisTitle, margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Dividir análise em linhas
    const maxLineWidth = pageWidth - (margin * 2);
    const analysisLines = doc.splitTextToSize(analysis, maxLineWidth);
    
    analysisLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Disclaimer
    yPosition += 10;
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const disclaimer = language === 'pt' 
      ? 'Este relatório foi gerado automaticamente por inteligência artificial. Recomenda-se revisão técnica antes do uso oficial.'
      : 'This report was automatically generated by artificial intelligence. Technical review is recommended before official use.';
    
    const disclaimerLines = doc.splitTextToSize(disclaimer, maxLineWidth);
    disclaimerLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    // Salvar PDF
    const fileName = `relatorio-agua-${city}-${river}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar o relatório PDF');
  }
}