import PointOverviewCards from './PointOverviewCards';
import PointParametersGrid from './PointParametersGrid';
import PointRadarChart from './PointRadarChart';
import CollectionPointsMap from '../CollectionPointsMap';
import ReadingsTable from '../ReadingsTable';

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

  if (readings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado encontrado para os pontos selecionados
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

  return (
    <div className="space-y-6">
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