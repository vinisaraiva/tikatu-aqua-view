
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
        <div className="h-80 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
          {/* Background map pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              {/* Rivers */}
              <path d="M50 150 Q200 100 350 180" stroke="#3b82f6" strokeWidth="3" fill="none" />
              <path d="M100 200 Q250 160 300 220" stroke="#3b82f6" strokeWidth="2" fill="none" />
              
              {/* City blocks */}
              <rect x="80" y="80" width="40" height="30" fill="#6b7280" opacity="0.3" />
              <rect x="150" y="120" width="50" height="40" fill="#6b7280" opacity="0.3" />
              <rect x="220" y="90" width="35" height="35" fill="#6b7280" opacity="0.3" />
              <rect x="280" y="140" width="45" height="25" fill="#6b7280" opacity="0.3" />
            </svg>
          </div>

          <div className="text-center z-10 relative">
            <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
              <MapIcon className="h-12 w-12 mx-auto text-teal-600" />
            </div>
            <p className="text-gray-700 font-medium mb-2">Mapa Interativo</p>
            <p className="text-sm text-gray-500 mb-4">
              {selectedPoints.length > 0 
                ? `Exibindo ${selectedPoints.length} ponto(s) de coleta`
                : 'Selecione pontos de coleta para visualizar no mapa'
              }
            </p>
            
            {selectedPoints.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedPoints.map((point, index) => {
                  const coords = mockCoordinates[point];
                  return (
                    <div key={point} className="flex items-center justify-between text-xs bg-white/80 backdrop-blur p-2 rounded border shadow-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                        />
                        <span className="font-medium">{point}</span>
                      </div>
                      {coords && (
                        <span className="text-gray-500">
                          ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Collection points on map */}
            {selectedPoints.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {selectedPoints.map((point, index) => {
                  const coords = mockCoordinates[point];
                  if (!coords) return null;
                  
                  // Convert coordinates to percentage position
                  const x = ((coords.lng + 46.65) / 0.05) * 100;
                  const y = ((coords.lat + 23.56) / 0.02) * 100;
                  
                  return (
                    <div
                      key={point}
                      className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{
                        backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
                        left: `${Math.max(5, Math.min(95, x))}%`,
                        top: `${Math.max(5, Math.min(95, 100 - y))}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
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
