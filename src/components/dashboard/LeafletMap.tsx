import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCities, useRivers, usePoints } from '@/hooks/useGeographicData';
import { useMapCache } from '@/hooks/useMapCache';

interface LeafletMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
  hideBusinessName?: boolean;
  useCache?: boolean;
}

// Custom blue droplet icon
const createCustomIcon = () => {
  const iconHtml = `
    <div style="width: 30px; height: 38px; position: relative;">
      <div style="
        width: 24px;
        height: 28px;
        background: #0284c7;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: absolute;
        top: 0;
        left: 3px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        border: 2px solid white;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38]
  });
};

// Component to handle map bounds updates
const MapBoundsUpdater = ({ points }: { points: Array<{ latitude: number; longitude: number }> }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const validPoints = points.filter(
        p => isFinite(p.latitude) && isFinite(p.longitude)
      );

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(
          validPoints.map(p => [p.latitude, p.longitude] as [number, number])
        );

        const padding = validPoints.length === 1 ? [100, 100] : [50, 50];
        const maxZoom = validPoints.length === 1 ? 14 : 12;

        map.fitBounds(bounds, {
          padding: padding as [number, number],
          maxZoom: maxZoom
        });
      }
    }
  }, [points, map]);

  return null;
};

const LeafletMap = ({ selectedPoints, city, river, hideBusinessName = false, useCache = false }: LeafletMapProps) => {
  const [selectedState, setSelectedState] = useState<string>('');

  // Fetch data based on useCache prop
  const { data: mapCache } = useMapCache();
  const { data: cities = [] } = useCities();
  const selectedCityData = cities.find(c => c.name === city);
  const { data: rivers = [] } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(r => r.name === river);
  const { data: allPoints = [] } = usePoints(selectedRiverData?.id);

  // Use cached data if enabled, otherwise use regular queries
  const displayPoints = useMemo(() => {
    if (useCache && mapCache?.points) {
      let points = mapCache.points;
      
      if (city) {
        points = points.filter(p => p.city_name === city);
      }
      if (river) {
        points = points.filter(p => p.river_name === river);
      }
      
      if (selectedPoints.length > 0) {
        points = points.filter(p => selectedPoints.includes(p.name));
      }
      
      return points.map(p => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        river_id: p.river_id,
        city_name: p.city_name,
        river_name: p.river_name,
        state: p.state
      }));
    }

    return selectedPoints.length > 0 
      ? allPoints.filter(point => selectedPoints.includes(point.name))
      : allPoints;
  }, [selectedPoints, allPoints, useCache, mapCache, city, river]);

  // Get unique states from points
  const statesInPoints = useMemo(() => {
    if (!useCache || !mapCache?.points) return [];
    
    const uniqueStates = new Set(displayPoints.map((p: any) => p.state).filter(Boolean));
    return Array.from(uniqueStates).sort();
  }, [displayPoints, useCache, mapCache]);

  // Auto-select first state if multiple states exist
  useEffect(() => {
    if (statesInPoints.length > 0 && !selectedState) {
      setSelectedState(statesInPoints[0]);
    }
  }, [statesInPoints, selectedState]);

  // Filter points by selected state
  const filteredDisplayPoints = useMemo(() => {
    if (statesInPoints.length <= 1 || !selectedState) {
      return displayPoints;
    }
    return displayPoints.filter((p: any) => p.state === selectedState);
  }, [displayPoints, selectedState, statesInPoints]);

  // Calculate center coordinates
  const getCenterCoordinates = (): [number, number] => {
    if (filteredDisplayPoints.length > 0) {
      const validPoints = filteredDisplayPoints.filter(
        (p: any) => isFinite(p.latitude) && isFinite(p.longitude)
      );
      
      if (validPoints.length > 0) {
        const avgLat = validPoints.reduce((sum: number, p: any) => sum + p.latitude, 0) / validPoints.length;
        const avgLng = validPoints.reduce((sum: number, p: any) => sum + p.longitude, 0) / validPoints.length;
        return [avgLat, avgLng];
      }
    }

    // Default center for cities
    const cityDefaults: Record<string, [number, number]> = {
      'Belém': [-1.4558, -48.4902],
      'Abaetetuba': [-1.7219, -48.8788]
    };

    return cityDefaults[city] || [-1.4558, -48.4902];
  };

  const center = getCenterCoordinates();
  const customIcon = createCustomIcon();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {!hideBusinessName && 'Tikatuar - '}
            Mapa de Pontos de Coleta
          </CardTitle>
          {statesInPoints.length > 1 && (
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {statesInPoints.map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {city && river && (
          <p className="text-sm text-muted-foreground">
            {city} → {river} → {filteredDisplayPoints.length} ponto(s)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border shadow-sm">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBoundsUpdater points={filteredDisplayPoints} />

            {filteredDisplayPoints
              .filter((point: any) => isFinite(point.latitude) && isFinite(point.longitude))
              .map((point: any) => {
                const riverName = useCache ? point.river_name : river;
                const cityName = useCache ? point.city_name : city;

                return (
                  <Marker
                    key={point.id}
                    position={[point.latitude, point.longitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong className="block mb-1">{point.name}</strong>
                        <span className="text-muted-foreground">Rio: {riverName}</span>
                        <br />
                        <span className="text-muted-foreground">Cidade: {cityName}</span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeafletMap;
