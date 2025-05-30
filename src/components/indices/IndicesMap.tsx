
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapboxMap from '@/components/dashboard/MapboxMap';

interface IndicesMapProps {
  coords: { lat: number; lng: number };
  pointName: string;
}

const IndicesMap = ({ coords, pointName }: IndicesMapProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Localização do Ponto de Coleta</CardTitle>
        {pointName && (
          <p className="text-sm text-gray-600">
            Ponto: {pointName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 rounded-lg overflow-hidden">
          <MapboxMap 
            selectedPoints={pointName ? [pointName] : []}
            city=""
            river=""
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicesMap;
