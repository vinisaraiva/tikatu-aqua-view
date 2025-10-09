
import MapboxMap from './MapboxMap';

interface CollectionPointsMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
}

const CollectionPointsMap = ({ selectedPoints, city, river }: CollectionPointsMapProps) => {
  return (
    <MapboxMap 
      selectedPoints={selectedPoints} 
      city={city} 
      river={river} 
    />
  );
};

export default CollectionPointsMap;
