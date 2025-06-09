
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoints } from '@/hooks/useGeographicData';
import { useReadings } from '@/hooks/useReadingsData';
import IndicesMap from './IndicesMap';
import IetTab from './IetTab';

interface IetIndiceProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  startDate?: Date;
  endDate?: Date;
}

const IetIndice = ({ selectedCity, selectedRiver, selectedPoints, startDate, endDate }: IetIndiceProps) => {
  // CORREÇÃO: Limpar duplicatas logo no início e adicionar logs detalhados
  const uniqueSelectedPoints = [...new Set(selectedPoints)];
  
  console.log('=== IET INDICE DEBUG - ANTI-DUPLICATA ===');
  console.log('IetIndice - Pontos recebidos (ORIGINAL):', selectedPoints);
  console.log('IetIndice - Pontos únicos (LIMPOS):', uniqueSelectedPoints);
  console.log('IetIndice - Quantidade original vs limpa:', selectedPoints.length, 'vs', uniqueSelectedPoints.length);
  
  // Get all points to map names to IDs
  const { data: allPoints = [] } = usePoints();
  
  // Filter points by selected names and get their IDs
  const selectedPointData = allPoints.filter(point => uniqueSelectedPoints.includes(point.name));
  const pointIds = selectedPointData.map(point => point.id);
  
  console.log('IetIndice - Dados dos pontos selecionados:', selectedPointData.map(p => ({ id: p.id, name: p.name, river_id: p.river_id })));
  console.log('IetIndice - IDs para buscar leituras:', pointIds);
  
  // Fetch readings for selected points
  const { data: readings = [], isLoading, error } = useReadings(pointIds, startDate, endDate);

  console.log('IetIndice - Leituras recebidas:', readings.length);

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

  if (!readings || readings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Nenhuma leitura encontrada para os filtros selecionados</p>
        <p className="text-sm text-gray-400">Experimente ajustar o período ou selecionar outros pontos</p>
      </div>
    );
  }

  // Group readings by point and get latest IET score for each
  const pointReadings = selectedPointData.map(point => {
    const pointReadingsList = readings.filter(r => r.point_id === point.id);
    const latestReading = pointReadingsList[0]; // readings are ordered by measured_at desc
    
    console.log(`Point ${point.name} (ID: ${point.id}):`, {
      readingsCount: pointReadingsList.length,
      latestIET: latestReading?.iet_score
    });
    
    return {
      pointId: point.id.toString(),
      pointName: point.name,
      iet: latestReading?.iet_score || 0,
      history: pointReadingsList.map(r => ({
        date: r.measured_at.split('T')[0],
        iqa: 0, // Will be used by IetTab component
        iet: r.iet_score || 0
      })),
      coords: { lat: point.latitude, lng: point.longitude }
    };
  });

  console.log('IetIndice - Dados finais dos pontos:', pointReadings.map(pr => ({ 
    pointId: pr.pointId, 
    pointName: pr.pointName, 
    iet: pr.iet 
  })));

  return (
    <div className="space-y-6">
      {/* Date Filter Info */}
      {(startDate || endDate) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="text-sm text-orange-800">
              <strong>Período filtrado:</strong> 
              {startDate && endDate && startDate.getTime() !== endDate.getTime() ? (
                <> {startDate.toLocaleDateString('pt-BR')} até {endDate.toLocaleDateString('pt-BR')}</>
              ) : startDate ? (
                <> {startDate.toLocaleDateString('pt-BR')}</>
              ) : (
                ' Todos os dados disponíveis'
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IET Overview Cards */}
      {uniqueSelectedPoints.length === 1 ? (
        <Card className={`border-2 ${getIetColor(pointReadings[0]?.iet || 0)}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-gray-700">IET Atual</CardTitle>
            <div className="text-4xl font-bold text-gray-900">{pointReadings[0]?.iet || 0}</div>
            <p className="text-sm text-gray-600">Índice do Estado Trófico</p>
            <p className="text-sm text-gray-500">{pointReadings[0]?.pointName}</p>
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
            <p className="text-sm text-gray-500">{selectedRiver} ({uniqueSelectedPoints.length} pontos)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointReadings.map((pointData) => (
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
        pointsData={pointReadings.map(d => ({ 
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
        pointsData={pointReadings}
        city={selectedCity}
        river={selectedRiver}
      />
    </div>
  );
};

export default IetIndice;
