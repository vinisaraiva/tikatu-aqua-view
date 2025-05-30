
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverviewCardsProps {
  iqa: number;
  iet: number;
}

const OverviewCards = ({ iqa, iet }: OverviewCardsProps) => {
  const getIqaColor = (value: number) => {
    if (value >= 80) return 'border-green-400 bg-green-50';
    if (value >= 60) return 'border-blue-400 bg-blue-50';
    if (value >= 40) return 'border-yellow-400 bg-yellow-50';
    if (value >= 20) return 'border-orange-400 bg-orange-50';
    return 'border-red-400 bg-red-50';
  };

  const getIetColor = (value: number) => {
    if (value <= 20) return 'border-blue-400 bg-blue-50';
    if (value <= 40) return 'border-green-400 bg-green-50';
    if (value <= 60) return 'border-yellow-400 bg-yellow-50';
    if (value <= 80) return 'border-orange-400 bg-orange-50';
    return 'border-red-400 bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* IQA Card */}
      <Card className={`border-2 ${getIqaColor(iqa)}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-medium text-gray-700">IQA</CardTitle>
          <div className="text-4xl font-bold text-gray-900">{iqa}</div>
          <p className="text-sm text-gray-600">Índice de Qualidade da Água</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
        </CardContent>
      </Card>

      {/* IET Card */}
      <Card className={`border-2 ${getIetColor(iet)}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-medium text-gray-700">IET</CardTitle>
          <div className="text-4xl font-bold text-gray-900">{iet}</div>
          <p className="text-sm text-gray-600">Índice do Estado Trófico</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
