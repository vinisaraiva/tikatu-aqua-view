
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';
import ReadingsChart from './ReadingsChart';
import CollectionPointsMap from './CollectionPointsMap';

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
}

const RecentReadings = ({ city, river, points }: RecentReadingsProps) => {
  // Generate mock data for multiple points
  const generateMockReadings = (selectedPoints: string[]): Reading[] => {
    const parameters = [
      { name: 'pH', unit: '', range: [6.5, 8.5] },
      { name: 'Oxigênio Dissolvido', unit: 'mg/L', range: [4, 8] },
      { name: 'Turbidez', unit: 'NTU', range: [5, 20] },
      { name: 'Temperatura', unit: '°C', range: [20, 28] },
    ];

    const readings: Reading[] = [];
    
    selectedPoints.forEach((point, pointIndex) => {
      parameters.forEach((param, paramIndex) => {
        const baseValue = param.range[0] + (param.range[1] - param.range[0]) * Math.random();
        const value = Math.round(baseValue * 10) / 10;
        
        // Determine status based on parameter and value
        let conamaStatus: 'normal' | 'attention' | 'critical' = 'normal';
        let hasAnomaly = false;
        
        if (param.name === 'pH') {
          if (value < 6.0 || value > 9.0) conamaStatus = 'critical';
          else if (value < 6.5 || value > 8.5) conamaStatus = 'attention';
        } else if (param.name === 'Oxigênio Dissolvido') {
          if (value < 4) conamaStatus = 'critical';
          else if (value < 5) conamaStatus = 'attention';
        } else if (param.name === 'Turbidez') {
          if (value > 15) conamaStatus = 'critical';
          else if (value > 10) conamaStatus = 'attention';
        }
        
        if (conamaStatus !== 'normal') hasAnomaly = true;
        
        readings.push({
          id: `${pointIndex}-${paramIndex}`,
          parameter: param.name,
          value,
          unit: param.unit,
          datetime: '2024-05-29 14:30:00',
          conamaStatus,
          hasAnomaly,
          point,
        });
      });
    });
    
    return readings;
  };

  const { data: readings, isLoading, error } = useQuery({
    queryKey: ['monitoring', city, river, points],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockReadings(points);
    },
    enabled: !!(city && river && points.length > 0),
  });

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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      {/* Gráfico e Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {readings && <ReadingsChart readings={readings} />}
        <CollectionPointsMap selectedPoints={points} city={city} river={river} />
      </div>

      {/* Tabela de Leituras */}
      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
          <p className="text-sm text-gray-600">
            {city} → {river} → {points.join(', ')}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Carregando dados...</span>
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
                  {readings?.map((reading) => (
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
