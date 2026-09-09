
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircleIcon, LoaderIcon } from 'lucide-react';
import ReadingsChart from './ReadingsChart';
import CollectionPointsMap from './CollectionPointsMap';
import ReadingsTable from './ReadingsTable';
import ReadingsFilters from './ReadingsFilters';
import { transformReadingsData } from './ReadingsDataTransformer';
import { useReadings, useReadingValues, DEFAULT_WINDOW_DAYS, READINGS_LIMIT } from '@/hooks/useReadingsData';
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
  const { data: cities = [] } = useCities();
  const selectedCityData = cities.find(c => c.name === city);

  const { data: rivers = [] } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(r => r.name === river);

  const { data: allPoints = [] } = usePoints(selectedRiverData?.id);
  const selectedPointsData = allPoints.filter(point => points.includes(point.name));
  const pointIds = selectedPointsData.map(point => point.id);

  const { data: readings = [], isLoading: readingsLoading, error: readingsError } = useReadings(pointIds, startDate, endDate);
  const readingIds = readings.map(reading => reading.id);
  const { data: readingValues = [], isLoading: valuesLoading } = useReadingValues(readingIds);

  const transformedReadings = transformReadingsData({
    readingValues,
    readings,
    selectedPointsData,
    parameter
  });

  const isLoading = readingsLoading || valuesLoading;
  const error = readingsError;
  const usingDefaultWindow = !startDate && !endDate;
  const truncated = readings.length >= READINGS_LIMIT;

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
          <ReadingsChart readings={[]} selectedParameter={parameter} />
          <CollectionPointsMap selectedPoints={[]} city="" river="" />
        </div>
      </div>
    );
  }

  if (error) {
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
      {usingDefaultWindow && (
        <p className="text-xs text-gray-500">
          Mostrando os últimos {DEFAULT_WINDOW_DAYS} dias — escolha um período para ver mais.
        </p>
      )}
      {truncated && (
        <p className="text-xs text-amber-600">
          Muitos registros no período selecionado. Reduza o intervalo de datas para ver todos os dados.
        </p>
      )}

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
