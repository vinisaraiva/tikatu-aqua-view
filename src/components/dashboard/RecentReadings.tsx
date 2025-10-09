
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircleIcon, LoaderIcon } from 'lucide-react';
import ReadingsChart from './ReadingsChart';
import CollectionPointsMap from './CollectionPointsMap';
import ReadingsTable from './ReadingsTable';
import ReadingsFilters from './ReadingsFilters';
import { transformReadingsData } from './ReadingsDataTransformer';
import { useReadings, useReadingValues } from '@/hooks/useReadingsData';
import { useCities, useRivers, usePoints } from '@/hooks/useGeographicData';

interface RecentReadingsProps {
  city: string;
  river: string;
  points: string[];
  parameter: string;
  startDate?: Date;
  endDate?: Date;
}

const RecentReadings = ({ city, river, points, parameter, startDate, endDate }: RecentReadingsProps) => {
  console.log('RecentReadings - Props recebidas:', { city, river, points, parameter, startDate, endDate });

  // CORREÇÃO: Buscar dados da cidade e rio para obter os IDs corretos
  const { data: cities = [] } = useCities();
  const selectedCityData = cities.find(c => c.name === city);
  console.log('RecentReadings - Cidade selecionada:', selectedCityData);
  
  const { data: rivers = [] } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(r => r.name === river);
  console.log('RecentReadings - Rio selecionado:', selectedRiverData);
  
  // CORREÇÃO: Usar o ID do rio para buscar pontos específicos desse rio
  const { data: allPoints = [] } = usePoints(selectedRiverData?.id);
  console.log('RecentReadings - Todos os pontos do rio:', allPoints);
  
  const selectedPointsData = allPoints.filter(point => points.includes(point.name));
  console.log('RecentReadings - Pontos selecionados:', selectedPointsData);
  
  const pointIds = selectedPointsData.map(point => point.id);
  console.log('RecentReadings - IDs dos pontos:', pointIds);

  // Fetch real readings data
  const { data: readings = [], isLoading: readingsLoading, error: readingsError } = useReadings(pointIds, startDate, endDate);
  console.log('RecentReadings - Leituras brutas:', readings);
  console.log('RecentReadings - Loading readings:', readingsLoading);
  console.log('RecentReadings - Error readings:', readingsError);
  
  // Get reading IDs to fetch parameter values
  const readingIds = readings.map(reading => reading.id);
  console.log('RecentReadings - IDs das leituras:', readingIds);
  
  const { data: readingValues = [], isLoading: valuesLoading } = useReadingValues(readingIds);
  console.log('RecentReadings - Valores das leituras:', readingValues);
  console.log('RecentReadings - Loading values:', valuesLoading);

  // Transform data for display
  const transformedReadings = transformReadingsData({
    readingValues,
    readings,
    selectedPointsData,
    parameter
  });
  console.log('RecentReadings - Dados transformados:', transformedReadings);

  const isLoading = readingsLoading || valuesLoading;
  const error = readingsError;

  if (!city || !river || points.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leituras Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Selecione uma cidade, rio e pelo menos um ponto de coleta para visualizar as leituras</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Valores de Parâmetros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Selecione filtros para visualizar o gráfico
              </div>
            </CardContent>
          </Card>
          <CollectionPointsMap selectedPoints={[]} city="" river="" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('RecentReadings - Erro ao carregar dados:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Erro ao carregar os dados. Tente novamente.</p>
            <p className="text-sm mt-2">{error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico e Mapa lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReadingsChart readings={transformedReadings} selectedParameter={parameter} />
        <CollectionPointsMap selectedPoints={points} city={city} river={river} />
      </div>

      {/* Tabela de Leituras */}
      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
          <ReadingsFilters 
            city={city}
            river={river}
            points={points}
            parameter={parameter}
            startDate={startDate}
            endDate={endDate}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
          ) : transformedReadings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma leitura encontrada para os filtros selecionados</p>
              <div className="text-xs mt-4 text-left bg-gray-100 p-3 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>Cidade: {city} (ID: {selectedCityData?.id})</p>
                <p>Rio: {river} (ID: {selectedRiverData?.id})</p>
                <p>Pontos: {points.join(', ')} (IDs: {pointIds.join(', ')})</p>
                <p>Parâmetro: {parameter}</p>
                <p>Leituras encontradas: {readings.length}</p>
                <p>Valores encontrados: {readingValues.length}</p>
                <p>Dados transformados: {transformedReadings.length}</p>
              </div>
            </div>
          ) : (
            <ReadingsTable readings={transformedReadings} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentReadings;
