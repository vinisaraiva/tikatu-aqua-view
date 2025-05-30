
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface IetTabProps {
  history: { date: string; iqa: number; iet: number }[];
}

const IetTab = ({ history }: IetTabProps) => {
  // Aggregate data by month for comparison chart
  const monthlyData = history.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('pt-BR', { month: 'short' });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.iet = (existing.iet + item.iet) / 2;
    } else {
      acc.push({ month, iet: item.iet });
    }
    return acc;
  }, [] as { month: string; iet: number }[]);

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Série Temporal do IET</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  formatter={(value) => [value, 'IET']}
                />
                <Line 
                  type="monotone" 
                  dataKey="iet" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Mensal do IET</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
