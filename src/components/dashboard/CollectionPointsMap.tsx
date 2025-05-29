
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';

interface CollectionPointsMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
}

const CollectionPointsMap = ({ selectedPoints, city, river }: CollectionPointsMapProps) => {
  // Mock coordinates for demonstration
  const mockCoordinates: Record<string, { lat: number; lng: number }> = {
    'Ponto 001': { lat: -23.5505, lng: -46.6333 },
    'Ponto 002': { lat: -23.5515, lng: -46.6343 },
    'Ponto 003': { lat: -23.5525, lng: -46.6353 },
    'Ponto 004': { lat: -23.5535, lng: -46.6363 },
    'Ponto 005': { lat: -23.5545, lng: -46.6373 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Mapa dos Pontos de Coleta
        </CardTitle>
        {city && river && (
          <p className="text-sm text-gray-600">
            {city} → {river}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <MapIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Mapa Interativo</p>
            <p className="text-sm text-gray-500">
              {selectedPoints.length > 0 
                ? `Exibindo ${selectedPoints.length} ponto(s): ${selectedPoints.join(', ')}`
                : 'Selecione pontos de coleta para visualizar no mapa'
              }
            </p>
            {selectedPoints.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedPoints.map((point, index) => {
                  const coords = mockCoordinates[point];
                  return (
                    <div key={point} className="text-xs bg-white p-2 rounded border">
                      <span className="font-medium">{point}</span>
                      {coords && (
                        <span className="text-gray-500 ml-2">
                          ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionPointsMap;
