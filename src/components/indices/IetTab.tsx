
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PointData {
  pointId: string;
  pointName: string;
  history: { date: string; iqa: number; iet: number }[];
}

interface IetTabProps {
  pointsData: PointData[];
}

const colors = ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];

const IetTab = ({ pointsData }: IetTabProps) => {
  // Combine all history data for multi-line chart
  const combinedHistory = pointsData[0]?.history.map(item => {
    const dataPoint: any = { date: item.date };
    pointsData.forEach((point, index) => {
      const pointHistory = point.history.find(h => h.date === item.date);
      dataPoint[point.pointId] = pointHistory?.iet || 0;
    });
    return dataPoint;
  }) || [];

  // Aggregate data by month for comparison chart
  const monthlyData = pointsData.map(point => {
    const monthlyAvg = point.history.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' });
      const existing = acc.find(d => d.month === month);
      if (existing) {
        existing.iet = (existing.iet + item.iet) / 2;
      } else {
        acc.push({ month, iet: item.iet });
      }
      return acc;
    }, [] as { month: string; iet: number }[]);
    
    return {
      pointName: point.pointName,
      pointId: point.pointId,
      monthlyData: monthlyAvg
    };
  });

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Série Temporal do IET</CardTitle>
          {pointsData.length > 1 && (
            <p className="text-sm text-gray-600">
              Comparação entre {pointsData.length} pontos de coleta
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  formatter={(value, name) => {
                    const pointName = pointsData.find(p => p.pointId === name)?.pointName || name;
                    return [value, pointName];
                  }}
                />
                {pointsData.map((point, index) => (
                  <Line 
                    key={point.pointId}
                    type="monotone" 
                    dataKey={point.pointId} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                    name={point.pointName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend for multiple points */}
          {pointsData.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {pointsData.map((point, index) => (
                <div key={point.pointId} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium">{point.pointName}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Comparison Chart - Only show for single point */}
      {pointsData.length === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação Mensal do IET</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData[0]?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [value, 'IET Médio']} />
                  <Bar dataKey="iet" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o IET</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            O IET (Índice do Estado Trófico) indica o nível trófico dos corpos d'água, classificando-os quanto ao 
            enriquecimento por nutrientes e seu efeito relacionado ao crescimento excessivo das algas. Valores mais 
            baixos indicam águas mais oligotróficas (pobres em nutrientes), enquanto valores mais altos indicam 
            águas eutróficas (ricas em nutrientes).
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">≤ 20</div>
              <div className="text-gray-600">Oligotrófico</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">21-40</div>
              <div className="text-gray-600">Mesotrófico</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">41-60</div>
              <div className="text-gray-600">Eutrófico</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-orange-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">&gt; 60</div>
              <div className="text-gray-600">Hipereutrófico</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IetTab;
