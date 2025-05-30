
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import IndicesMap from './IndicesMap';
import IqaTab from './IqaTab';

interface IqaIndiceProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
}

interface IqaData {
  iqa: number;
  history: { date: string; iqa: number }[];
  coords: { lat: number; lng: number };
}

const useIqaData = (city: string, river: string, point: string) => {
  return useQuery({
    queryKey: ['iqa', city, river, point],
    queryFn: async (): Promise<IqaData> => {
      // Mock data específica para IQA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        iqa: 78,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          iqa: Math.floor(Math.random() * 40) + 60
        })),
        coords: { lat: -23.5505, lng: -46.6333 }
      };
    },
    enabled: !!(city && river && point)
  });
};

const IqaIndice = ({ selectedCity, selectedRiver, selectedPoints }: IqaIndiceProps) => {
  const { data, isLoading, error } = useIqaData(selectedCity, selectedRiver, selectedPoints[0] || '');

  const getIqaColor = (value: number) => {
    if (value >= 80) return 'border-green-400 bg-green-50';
    if (value >= 60) return 'border-blue-400 bg-blue-50';
    if (value >= 40) return 'border-yellow-400 bg-yellow-50';
    if (value >= 20) return 'border-orange-400 bg-orange-50';
    return 'border-red-400 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Erro ao carregar dados do IQA</p>
        <p className="text-gray-500">Verifique os filtros selecionados e tente novamente</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* IQA Overview Card */}
      <Card className={`border-2 ${getIqaColor(data.iqa)}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-medium text-gray-700">IQA Atual</CardTitle>
          <div className="text-4xl font-bold text-gray-900">{data.iqa}</div>
          <p className="text-sm text-gray-600">Índice de Qualidade da Água</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Baseado em parâmetros físico-químicos e biológicos
          </p>
        </CardContent>
      </Card>

      {/* Map */}
      <IndicesMap 
        coords={data.coords} 
        pointName={selectedPoints[0] || ''} 
      />

      {/* IQA Analysis */}
      <IqaTab history={data.history.map(h => ({ ...h, iet: 0 }))} />
    </div>
  );
};

export default IqaIndice;
