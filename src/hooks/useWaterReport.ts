import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  city: string;
  river: string;
  points: string[];
  parameter: string;
  startDate?: Date;
  endDate?: Date;
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

interface UseWaterReportReturn {
  generateReport: (data: ReportData) => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
}

export function useWaterReport(): UseWaterReportReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async (data: ReportData): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('Calling generate-water-report function with data:', data);
      
      // Usar os dados dos parâmetros que já vêm nas readings
      const enrichedData = {
        ...data,
        readings: data.readings.map(reading => ({
          ...reading,
          parameterCode: reading.parameterCode || reading.unit || '',
          parameterDescription: reading.parameterDescription || reading.unit || ''
        }))
      };

      const { data: result, error: functionError } = await supabase.functions.invoke(
        'generate-water-report',
        {
          body: enrichedData
        }
      );

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Erro ao chamar função do Supabase');
      }

      if (result?.error) {
        console.error('Function returned error:', result.error);
        throw new Error(result.error);
      }

      console.log('Report generated successfully');
      
      toast({
        title: "Relatório gerado com sucesso",
        description: "A análise foi criada pela IA.",
      });

      return result.analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Error generating report:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Erro ao gerar relatório",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating,
    error
  };
}