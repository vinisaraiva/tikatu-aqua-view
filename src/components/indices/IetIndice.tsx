
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

interface IetPointData {
  pointId: string;
  pointName: string;
  iet: number;
  history: { date: string; iet: number }[];
  coords: { lat: number; lng: number };
}

const useIetData = (city: string, river: string, points: string[]) => {
  return useQuery({
    queryKey: ['iet', city, river, points],
    queryFn: async (): Promise<IetPointData[]> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Coordinates mapping by city and river
      const cityCoordinates = {
        'São Paulo': {
          'Rio Tietê': { lat: -23.5505, lng: -46.6333 },
          'Rio Pinheiros': { lat: -23.5629, lng: -46.6544 },
          'Rio Tamanduateí': { lat: -23.5431, lng: -46.6097 }
        },
        'Rio de Janeiro': {
          'Rio Guandu': { lat: -22.8305, lng: -43.4428 },
          'Rio Paraíba do Sul': { lat: -22.5167, lng: -43.1833 }
        },
        'Belo Horizonte': {
          'Rio das Velhas': { lat: -19.9167, lng: -43.9345 },
          'Rio Arrudas': { lat: -19.9208, lng: -43.9378 }
        },
        'Brasília': {
          'Rio Descoberto': { lat: -15.7975, lng: -48.1297 },
          'Rio Paranoá': { lat: -15.7801, lng: -47.8069 }
        }
      };

      const baseCoords = cityCoordinates[city]?.[river] || { lat: -23.5505, lng: -46.6333 };
      
      return points.map((point, index) => ({
        pointId: point,
        pointName: point,
        iet: Math.floor(Math.random() * 30) + 30, // 30-60 range
        history: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          iet: Math.floor(Math.random() * 30) + 30
        })),
        coords: { 
          lat: baseCoords.lat + (index * 0.005), 
          lng: baseCoords.lng + (index * 0.005) 
        }
      }));
    },
    enabled: !!(city && river && points.length > 0)
  });
};

const IetIndice = ({ selectedCity, selectedRiver, selectedPoints }: IetIndiceProps) => {
  const { data, isLoading, error } = useIetData(selectedCity, selectedRiver, selectedPoints);

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

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* IET Overview Cards */}
      {selectedPoints.length === 1 ? (
        <Card className={`border-2 ${getIetColor(data[0].iet)}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-gray-700">IET Atual</CardTitle>
            <div className="text-4xl font-bold text-gray-900">{data[0].iet}</div>
            <p className="text-sm text-gray-600">Índice do Estado Trófico</p>
            <p className="text-sm text-gray-500">{data[0].pointName}</p>
            <p className="text-xs text-gray-400">{selectedCity} - {selectedRiver}</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Avaliação do nível de eutrofização
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">IET - {selectedCity}</h3>
            <p className="text-sm text-gray-500">{selectedRiver} ({selectedPoints.length} pontos)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((pointData) => (
              <Card key={pointData.pointId} className={`border-2 ${getIetColor(pointData.iet)}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-sm font-medium text-gray-700">{pointData.pointName}</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{pointData.iet}</div>
                  <p className="text-xs text-gray-600">IET</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <IndicesMap 
        pointsData={data.map(d => ({ 
          id: d.pointId, 
          name: d.pointName, 
          coords: d.coords,
          value: d.iet 
        }))}
        city={selectedCity}
        river={selectedRiver}
      />

      {/* IET Analysis */}
      <IetTab 
        pointsData={data.map(d => ({
          pointId: d.pointId,
          pointName: d.pointName,
          history: d.history.map(h => ({ ...h, iqa: 0 }))
        }))}
        city={selectedCity}
        river={selectedRiver}
      />
    </div>
  );
};

export default IetIndice;
