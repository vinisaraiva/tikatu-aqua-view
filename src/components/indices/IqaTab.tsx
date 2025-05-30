
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PointData {
  pointId: string;
  pointName: string;
  history: { date: string; iqa: number; iet: number }[];
}

interface IqaTabProps {
  pointsData: PointData[];
}

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const IqaTab = ({ pointsData }: IqaTabProps) => {
  // Combine all history data for multi-line chart
  const combinedHistory = pointsData[0]?.history.map(item => {
    const dataPoint: any = { date: item.date };
    pointsData.forEach((point, index) => {
      const pointHistory = point.history.find(h => h.date === item.date);
      dataPoint[point.pointId] = pointHistory?.iqa || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Série Temporal do IQA</CardTitle>
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

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o IQA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            O IQA (Índice de Qualidade da Água) varia de 0 a 100, sendo que valores mais altos indicam melhor qualidade da água. 
            É calculado com base em diversos parâmetros físico-químicos e biológicos, fornecendo uma avaliação integrada da 
            qualidade da água para consumo humano e proteção da vida aquática.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">0-20</div>
              <div className="text-gray-600">Péssima</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-orange-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">21-40</div>
              <div className="text-gray-600">Ruim</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">41-60</div>
              <div className="text-gray-600">Regular</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">61-80</div>
              <div className="text-gray-600">Boa</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
              <div className="font-medium">81-100</div>
              <div className="text-gray-600">Ótima</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IqaTab;
