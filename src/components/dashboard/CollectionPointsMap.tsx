
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
        <div className="h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex flex-col items-center justify-center border relative overflow-hidden">
          {/* Improved visual map representation */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 400 320" className="absolute inset-0">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Rivers */}
              <path d="M50 160 Q200 120 350 180" stroke="#2563eb" strokeWidth="4" fill="none" opacity="0.6" />
              <path d="M100 200 Q250 160 320 220" stroke="#2563eb" strokeWidth="3" fill="none" opacity="0.4" />
              
              {/* City areas */}
              <rect x="80" y="80" width="40" height="30" fill="#6b7280" opacity="0.2" rx="2" />
              <rect x="150" y="120" width="50" height="40" fill="#6b7280" opacity="0.2" rx="2" />
              <rect x="220" y="90" width="35" height="35" fill="#6b7280" opacity="0.2" rx="2" />
              <rect x="280" y="140" width="45" height="25" fill="#6b7280" opacity="0.2" rx="2" />
              
              {/* Collection points on map */}
              {selectedPoints.map((point, index) => {
                const coords = mockCoordinates[point];
                if (!coords) return null;
                
                // Convert coordinates to map position
                const x = 50 + (index * 60) + Math.random() * 40;
                const y = 100 + (index * 30) + Math.random() * 60;
                
                return (
                  <g key={point}>
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={`hsl(${index * 45}, 70%, 50%)`}
                      stroke="white"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {point}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-center z-10 relative bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="bg-teal-100 rounded-full p-3 mb-3 inline-block">
              <MapIcon className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-gray-700 font-medium mb-2">Localização dos Pontos</p>
            <p className="text-sm text-gray-500 mb-4">
              {selectedPoints.length > 0 
                ? `${selectedPoints.length} ponto(s) selecionado(s)`
                : 'Selecione pontos de coleta para visualizar'
              }
            </p>
            
            {selectedPoints.length > 0 && (
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {selectedPoints.slice(0, 3).map((point, index) => {
                  const coords = mockCoordinates[point];
                  return (
                    <div key={point} className="flex items-center justify-center text-xs">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                      />
                      <span className="font-medium">{point}</span>
                      {coords && (
                        <span className="text-gray-500 ml-2">
                          ({coords.lat.toFixed(3)}, {coords.lng.toFixed(3)})
                        </span>
                      )}
                    </div>
                  );
                })}
                {selectedPoints.length > 3 && (
                  <p className="text-xs text-gray-500">+{selectedPoints.length - 3} pontos</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionPointsMap;
