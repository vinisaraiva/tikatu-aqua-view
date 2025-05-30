
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

interface IqaPointData {
  pointId: string;
  pointName: string;
  iqa: number;
  history: { date: string; iqa: number }[];
  coords: { lat: number; lng: number };
}

const useIqaData = (city: string, river: string, points: string[]) => {
  return useQuery({
    queryKey: ['iqa', city, river, points],
    queryFn: async (): Promise<IqaPointData[]> => {
      // Mock data específica para IQA com múltiplos pontos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return points.map((point, index) => ({
        pointId: point,
        pointName: point,
        iqa: Math.floor(Math.random() * 40) + 60, // 60-100 range
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          iqa: Math.floor(Math.random() * 40) + 60
        })),
        coords: { 
          lat: -23.5505 + (index * 0.01), 
          lng: -46.6333 + (index * 0.01) 
        }
      }));
    },
    enabled: !!(city && river && points.length > 0)
  });
};

const IqaIndice = ({ selectedCity, selectedRiver, selectedPoints }: IqaIndiceProps) => {
  const { data, isLoading, error } = useIqaData(selectedCity, selectedRiver, selectedPoints);

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

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* IQA Overview Cards - Multiple points */}
      {selectedPoints.length === 1 ? (
        <Card className={`border-2 ${getIqaColor(data[0].iqa)}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-gray-700">IQA Atual</CardTitle>
            <div className="text-4xl font-bold text-gray-900">{data[0].iqa}</div>
            <p className="text-sm text-gray-600">Índice de Qualidade da Água</p>
            <p className="text-sm text-gray-500">{data[0].pointName}</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Baseado em parâmetros físico-químicos e biológicos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((pointData) => (
            <Card key={pointData.pointId} className={`border-2 ${getIqaColor(pointData.iqa)}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-sm font-medium text-gray-700">{pointData.pointName}</CardTitle>
                <div className="text-2xl font-bold text-gray-900">{pointData.iqa}</div>
                <p className="text-xs text-gray-600">IQA</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Map */}
      <IndicesMap 
        pointsData={data.map(d => ({ 
          id: d.pointId, 
          name: d.pointName, 
          coords: d.coords,
          value: d.iqa 
        }))} 
      />

      {/* IQA Analysis */}
      <IqaTab 
        pointsData={data.map(d => ({
          pointId: d.pointId,
          pointName: d.pointName,
          history: d.history.map(h => ({ ...h, iet: 0 }))
        }))} 
      />
    </div>
  );
};

export default IqaIndice;
