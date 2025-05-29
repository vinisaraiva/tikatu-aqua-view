
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircleIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from 'lucide-react';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
}

interface RecentReadingsProps {
  city: string;
  river: string;
  point: string;
}

const RecentReadings = ({ city, river, point }: RecentReadingsProps) => {
  // Mock data for demonstration
  const mockReadings: Reading[] = [
    {
      id: '1',
      parameter: 'pH',
      value: 7.2,
      unit: '',
      datetime: '2024-05-29 14:30:00',
      conamaStatus: 'normal',
      hasAnomaly: false,
    },
    {
      id: '2',
      parameter: 'Oxigênio Dissolvido',
      value: 5.8,
      unit: 'mg/L',
      datetime: '2024-05-29 14:30:00',
      conamaStatus: 'attention',
      hasAnomaly: true,
    },
    {
      id: '3',
      parameter: 'Turbidez',
      value: 12.5,
      unit: 'NTU',
      datetime: '2024-05-29 14:30:00',
      conamaStatus: 'critical',
      hasAnomaly: true,
    },
    {
      id: '4',
      parameter: 'Temperatura',
      value: 23.5,
      unit: '°C',
      datetime: '2024-05-29 14:30:00',
      conamaStatus: 'normal',
      hasAnomaly: false,
    },
  ];

  const { data: readings, isLoading, error } = useQuery({
    queryKey: ['monitoring', city, river, point],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockReadings;
    },
    enabled: !!(city && river && point),
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

  if (!city || !river || !point) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leituras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma cidade, rio e ponto de coleta para visualizar as leituras</p>
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Leituras Recentes</CardTitle>
        <p className="text-sm text-gray-600">
          {city} → {river} → {point}
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
  );
};

export default RecentReadings;
