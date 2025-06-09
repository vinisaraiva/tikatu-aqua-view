
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';
import ReadingsChart from './ReadingsChart';
import CollectionPointsMap from './CollectionPointsMap';
import { useReadings, useReadingValues } from '@/hooks/useReadingsData';
import { usePoints } from '@/hooks/useGeographicData';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
}

interface RecentReadingsProps {
  city: string;
  river: string;
  points: string[];
  startDate?: Date;
  endDate?: Date;
}

const RecentReadings = ({ city, river, points, startDate, endDate }: RecentReadingsProps) => {
  // Get point IDs from selected point names
  const { data: allPoints = [] } = usePoints();
  const selectedPointsData = allPoints.filter(point => points.includes(point.name));
  const pointIds = selectedPointsData.map(point => point.id);

  // Fetch real readings data
  const { data: readings = [], isLoading: readingsLoading, error: readingsError } = useReadings(pointIds, startDate, endDate);
  
  // Get reading IDs to fetch parameter values
  const readingIds = readings.map(reading => reading.id);
  const { data: readingValues = [], isLoading: valuesLoading } = useReadingValues(readingIds);

  // Transform data for display
  const transformedReadings: Reading[] = readingValues.map((value) => {
    const reading = readings.find(r => r.id === value.reading_id);
    const point = selectedPointsData.find(p => p.id === reading?.point_id);
    
    if (!reading || !point) return null;

    // Determine CONAMA status based on parameter limits
    let conamaStatus: 'normal' | 'attention' | 'critical' = 'normal';
    let hasAnomaly = false;

    if (value.parameter) {
      const { conama_min, conama_max } = value.parameter;
      
      if (conama_min !== null && value.value < conama_min) {
        conamaStatus = 'critical';
        hasAnomaly = true;
      } else if (conama_max !== null && value.value > conama_max) {
        conamaStatus = 'critical';
        hasAnomaly = true;
      } else if (conama_min !== null && value.value < conama_min * 1.2) {
        conamaStatus = 'attention';
        hasAnomaly = true;
      } else if (conama_max !== null && value.value > conama_max * 0.8) {
        conamaStatus = 'attention';
        hasAnomaly = true;
      }
    }

    return {
      id: `${reading.id}-${value.parameter_id}`,
      parameter: value.parameter?.description || 'Parâmetro Desconhecido',
      value: value.value,
      unit: value.parameter?.unit || '',
      datetime: reading.measured_at,
      conamaStatus,
      hasAnomaly,
      point: point.name,
    };
  }).filter(Boolean) as Reading[];

  const isLoading = readingsLoading || valuesLoading;
  const error = readingsError;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
      case 'attention':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Atenção</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Crítico</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getAnomalyIcon = (hasAnomaly: boolean) => {
    if (hasAnomaly) {
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  };

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
    } else if (startDate) {
      return startDate.toLocaleDateString('pt-BR');
    }
    return 'Dados recentes';
  };

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
          <ReadingsChart readings={[]} />
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico e Mapa lado a lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReadingsChart readings={transformedReadings} />
        <CollectionPointsMap selectedPoints={points} city={city} river={river} />
      </div>

      {/* Tabela de Leituras */}
      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
          <p className="text-sm text-gray-600">
            {city} → {river} → {points.join(', ')} | {getDateRangeText()}
          </p>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ponto</TableHead>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status CONAMA</TableHead>
                    <TableHead>Anomalia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transformedReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">
                        {reading.point}
                      </TableCell>
                      <TableCell className="font-medium">
                        {reading.parameter}
                      </TableCell>
                      <TableCell>
                        {reading.value} {reading.unit}
                      </TableCell>
                      <TableCell>
                        {new Date(reading.datetime).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reading.conamaStatus)}
                      </TableCell>
                      <TableCell>
                        {getAnomalyIcon(reading.hasAnomaly)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentReadings;
