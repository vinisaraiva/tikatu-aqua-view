
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircleIcon, LoaderIcon } from 'lucide-react';

interface AnomaliesChartProps {
  city: string;
  river: string;
  point: string;
}

const AnomaliesChart = ({ city, river, point }: AnomaliesChartProps) => {
  // Mock data for demonstration
  const mockData = [
    { time: '00:00', ph: 7.2, oxygen: 6.5, turbidity: 8.2, temperature: 22.1 },
    { time: '04:00', ph: 7.1, oxygen: 6.3, turbidity: 9.1, temperature: 21.8 },
    { time: '08:00', ph: 7.3, oxygen: 5.8, turbidity: 12.5, temperature: 23.2 },
    { time: '12:00', ph: 7.0, oxygen: 5.2, turbidity: 15.3, temperature: 24.5 },
    { time: '16:00', ph: 6.8, oxygen: 4.9, turbidity: 18.7, temperature: 25.1 },
    { time: '20:00', ph: 7.1, oxygen: 5.5, turbidity: 14.2, temperature: 23.8 },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['anomalies', city, river, point],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockData;
    },
    enabled: !!(city && river && point),
  });

  if (!city || !river || !point) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Anomalias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Selecione uma cidade, rio e ponto de coleta para visualizar as anomalias</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Anomalias</CardTitle>
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
      {/* pH Chart */}
      <Card>
        <CardHeader>
          <CardTitle>pH - Últimas 24 horas</CardTitle>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[6, 8]} />
                <Tooltip />
                <ReferenceLine y={6.5} stroke="red" strokeDasharray="5 5" label="Limite Inferior" />
                <ReferenceLine y={7.5} stroke="red" strokeDasharray="5 5" label="Limite Superior" />
                <Line 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Oxygen Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Oxigênio Dissolvido (mg/L) - Últimas 24 horas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <ReferenceLine y={5} stroke="red" strokeDasharray="5 5" label="Limite Crítico" />
                <Line 
                  type="monotone" 
                  dataKey="oxygen" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Turbidity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Turbidez (NTU) - Últimas 24 horas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 25]} />
                <Tooltip />
                <ReferenceLine y={10} stroke="orange" strokeDasharray="5 5" label="Limite Atenção" />
                <ReferenceLine y={15} stroke="red" strokeDasharray="5 5" label="Limite Crítico" />
                <Line 
                  type="monotone" 
                  dataKey="turbidity" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomaliesChart;
