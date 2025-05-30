
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapboxMap from '@/components/dashboard/MapboxMap';

interface PointData {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  value: number;
}

interface IndicesMapProps {
  pointsData: PointData[];
}

const IndicesMap = ({ pointsData }: IndicesMapProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Localização dos Pontos de Coleta</CardTitle>
        {pointsData.length > 0 && (
          <p className="text-sm text-gray-600">
            {pointsData.length} ponto{pointsData.length > 1 ? 's' : ''} selecionado{pointsData.length > 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 rounded-lg overflow-hidden">
          <MapboxMap 
            selectedPoints={pointsData.map(p => p.id)}
            city=""
            river=""
          />
        </div>
        
        {/* Points Summary */}
        {pointsData.length > 1 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Pontos no Mapa:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pointsData.map((point) => (
                <div key={point.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">{point.name}</span>
                  <span className="text-blue-600 font-semibold">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IndicesMap;
