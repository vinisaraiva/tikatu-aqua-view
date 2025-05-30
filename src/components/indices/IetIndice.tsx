
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import IndicesMap from './IndicesMap';
import IetTab from './IetTab';

interface IetIndiceProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
}

interface IetData {
  iet: number;
  history: { date: string; iet: number }[];
  coords: { lat: number; lng: number };
}

const useIetData = (city: string, river: string, point: string) => {
  return useQuery({
    queryKey: ['iet', city, river, point],
    queryFn: async (): Promise<IetData> => {
      // Mock data específica para IET
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        iet: 45,
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          iet: Math.floor(Math.random() * 30) + 30
        })),
        coords: { lat: -23.5505, lng: -46.6333 }
      };
    },
    enabled: !!(city && river && point)
  });
};

const IetIndice = ({ selectedCity, selectedRiver, selectedPoints }: IetIndiceProps) => {
  const { data, isLoading, error } = useIetData(selectedCity, selectedRiver, selectedPoints[0] || '');

  const getIetColor = (value: number) => {
    if (value <= 20) return 'border-blue-400 bg-blue-50';
    if (value <= 40) return 'border-green-400 bg-green-50';
    if (value <= 60) return 'border-yellow-400 bg-yellow-50';
    if (value <= 80) return 'border-orange-400 bg-orange-50';
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
        <p className="text-red-600 mb-4">Erro ao carregar dados do IET</p>
        <p className="text-gray-500">Verifique os filtros selecionados e tente novamente</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* IET Overview Card */}
      <Card className={`border-2 ${getIetColor(data.iet)}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-medium text-gray-700">IET Atual</CardTitle>
          <div className="text-4xl font-bold text-gray-900">{data.iet}</div>
          <p className="text-sm text-gray-600">Índice do Estado Trófico</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Avaliação do nível de eutrofização
          </p>
        </CardContent>
      </Card>

      {/* Map */}
      <IndicesMap 
        coords={data.coords} 
        pointName={selectedPoints[0] || ''} 
      />

      {/* IET Analysis */}
      <IetTab history={data.history.map(h => ({ ...h, iqa: 0 }))} />
    </div>
  );
};

export default IetIndice;
