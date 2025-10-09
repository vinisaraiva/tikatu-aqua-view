
import LeafletMap from './LeafletMap';

interface CollectionPointsMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
}

const CollectionPointsMap = ({ selectedPoints, city, river }: CollectionPointsMapProps) => {
  return (
    <LeafletMap 
      selectedPoints={selectedPoints} 
      city={city} 
      river={river} 
    />
  );
};

export default CollectionPointsMap;
