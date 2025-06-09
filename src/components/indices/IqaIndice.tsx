
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoints } from '@/hooks/useGeographicData';
import { useReadings } from '@/hooks/useReadingsData';
import IndicesMap from './IndicesMap';
import IqaTab from './IqaTab';

interface IqaIndiceProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  startDate?: Date;
  endDate?: Date;
}

const IqaIndice = ({ selectedCity, selectedRiver, selectedPoints, startDate, endDate }: IqaIndiceProps) => {
  // Remove duplicates from selected points
  const uniqueSelectedPoints = [...new Set(selectedPoints)];
  
  console.log('=== IQA INDICE DEBUG ===');
  console.log('IqaIndice - Original selected points:', selectedPoints);
  console.log('IqaIndice - Unique selected points:', uniqueSelectedPoints);
  console.log('IqaIndice - selectedPoints length:', selectedPoints.length);
  console.log('IqaIndice - uniqueSelectedPoints length:', uniqueSelectedPoints.length);
  
  // Get all points to map names to IDs
  const { data: allPoints = [] } = usePoints();
  
  // Filter points by selected names and get their IDs
  const selectedPointData = allPoints.filter(point => uniqueSelectedPoints.includes(point.name));
  const pointIds = selectedPointData.map(point => point.id);
  
  console.log('IqaIndice - All points available:', allPoints.map(p => p.name));
  console.log('IqaIndice - Selected point data:', selectedPointData.map(p => ({ id: p.id, name: p.name })));
  console.log('IqaIndice - Point IDs for readings:', pointIds);
  
  // Fetch readings for selected points
  const { data: readings = [], isLoading, error } = useReadings(pointIds, startDate, endDate);

  console.log('IqaIndice - Readings received:', readings.length);

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

  if (!readings || readings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Nenhuma leitura encontrada para os filtros selecionados</p>
        <p className="text-sm text-gray-400">Experimente ajustar o período ou selecionar outros pontos</p>
      </div>
    );
  }

  // Group readings by point and get latest IQA score for each
  const pointReadings = selectedPointData.map(point => {
    const pointReadingsList = readings.filter(r => r.point_id === point.id);
    const latestReading = pointReadingsList[0]; // readings are ordered by measured_at desc
    
    console.log(`Point ${point.name} (ID: ${point.id}):`, {
      readingsCount: pointReadingsList.length,
      latestIQA: latestReading?.iqa_score
    });
    
    return {
      pointId: point.id.toString(),
      pointName: point.name,
      iqa: latestReading?.iqa_score || 0,
      history: pointReadingsList.map(r => ({
        date: r.measured_at.split('T')[0],
        iqa: r.iqa_score || 0,
        iet: 0 // Will be used by IqaTab component
      })),
      coords: { lat: point.latitude, lng: point.longitude }
    };
  });

  console.log('IqaIndice - Final pointReadings:', pointReadings.map(pr => ({ 
    pointId: pr.pointId, 
    pointName: pr.pointName, 
    iqa: pr.iqa 
  })));

  return (
    <div className="space-y-6">
      {/* Date Filter Info */}
      {(startDate || endDate) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-sm text-blue-800">
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

      {/* IQA Overview Cards */}
      {uniqueSelectedPoints.length === 1 ? (
        <Card className={`border-2 ${getIqaColor(pointReadings[0]?.iqa || 0)}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-medium text-gray-700">IQA Atual</CardTitle>
            <div className="text-4xl font-bold text-gray-900">{pointReadings[0]?.iqa || 0}</div>
            <p className="text-sm text-gray-600">Índice de Qualidade da Água</p>
            <p className="text-sm text-gray-500">{pointReadings[0]?.pointName}</p>
            <p className="text-xs text-gray-400">{selectedCity} - {selectedRiver}</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Baseado em parâmetros físico-químicos e biológicos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">IQA - {selectedCity}</h3>
            <p className="text-sm text-gray-500">{selectedRiver} ({uniqueSelectedPoints.length} pontos)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointReadings.map((pointData) => (
              <Card key={pointData.pointId} className={`border-2 ${getIqaColor(pointData.iqa)}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-sm font-medium text-gray-700">{pointData.pointName}</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{pointData.iqa}</div>
                  <p className="text-xs text-gray-600">IQA</p>
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
          value: d.iqa 
        }))}
        city={selectedCity}
        river={selectedRiver}
      />

      {/* IQA Analysis */}
      <IqaTab 
        pointsData={pointReadings}
        city={selectedCity}
        river={selectedRiver}
      />
    </div>
  );
};

export default IqaIndice;
