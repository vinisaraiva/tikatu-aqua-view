import PointOverviewCards from './PointOverviewCards';
import PointParametersGrid from './PointParametersGrid';
import PointRadarChart from './PointRadarChart';
import CollectionPointsMap from '../CollectionPointsMap';
import ReadingsTable from '../ReadingsTable';
import { Card, CardContent } from '@/components/ui/card';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

interface PointViewProps {
  readings: Reading[];
  selectedPoints: string[];
  city: string;
  river: string;
}

const PointView = ({ readings, selectedPoints, city, river }: PointViewProps) => {
  if (selectedPoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Selecione um ou mais pontos de coleta para visualizar os dados
      </div>
    );
  }

  // Group readings by point
  const readingsByPoint = readings.reduce((acc, reading) => {
    if (!acc[reading.point]) {
      acc[reading.point] = [];
    }
    acc[reading.point].push(reading);
    return acc;
  }, {} as Record<string, Reading[]>);

  const selectedPointNames = selectedPoints.filter(point => readingsByPoint[point]);
  const pointsWithoutData = selectedPoints.filter(point => !readingsByPoint[point]);

  if (readings.length === 0 && pointsWithoutData.length === selectedPoints.length) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <div className="text-amber-800 mb-2">
              <span className="text-sm font-medium">Nenhum dado encontrado para os pontos selecionados</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {pointsWithoutData.map(point => (
                <span key={point} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  {point}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600">
              Verifique se existem leituras registradas para estes pontos no período selecionado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points without data warning */}
      {pointsWithoutData.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <span className="text-sm font-medium">Pontos sem dados disponíveis:</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {pointsWithoutData.map(point => (
                <span key={point} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  {point}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600">
              Estes pontos não possuem leituras registradas para o período selecionado.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Single point view */}
      {selectedPointNames.length === 1 ? (
        <div className="space-y-6">
          <PointOverviewCards 
            readings={readingsByPoint[selectedPointNames[0]]} 
            pointName={selectedPointNames[0]}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PointRadarChart 
              readings={readingsByPoint[selectedPointNames[0]]} 
              pointName={selectedPointNames[0]}
            />
            <CollectionPointsMap 
              selectedPoints={selectedPoints} 
              city={city} 
              river={river} 
            />
          </div>
          
          <PointParametersGrid readings={readingsByPoint[selectedPointNames[0]]} />
          
          <ReadingsTable readings={readingsByPoint[selectedPointNames[0]]} />
        </div>
      ) : (
        /* Multiple points view */
        <div className="space-y-6">
          {/* Combined overview for all points */}
          <PointOverviewCards 
            readings={readings} 
            pointName={`${selectedPointNames.length} pontos selecionados`}
          />
          
          <CollectionPointsMap 
            selectedPoints={selectedPoints} 
            city={city} 
            river={river} 
          />
          
          {/* Individual point sections */}
          {selectedPointNames.map(pointName => (
            <div key={pointName} className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {pointName}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PointParametersGrid readings={readingsByPoint[pointName]} />
                <PointRadarChart 
                  readings={readingsByPoint[pointName]} 
                  pointName={pointName}
                />
              </div>
            </div>
          ))}
          
          {/* Combined table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Todas as Leituras</h3>
            <ReadingsTable readings={readings} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PointView;