import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapIcon } from 'lucide-react';
import { usePoints, useRivers, useCities } from '@/hooks/useGeographicData';
import { useMapCache } from '@/hooks/useMapCache';

interface LeafletMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
  hideBusinessNames?: boolean;
  useCache?: boolean;
}

// Componente auxiliar para ajustar bounds do mapa
const FitBounds = ({ points }: { points: any[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length === 0) return;
    
    const validPoints = points.filter(p => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    });

    if (validPoints.length === 0) return;
    
    const bounds = L.latLngBounds(
      validPoints.map(p => [Number(p.latitude), Number(p.longitude)])
    );
    
    // Lógica de padding dinâmico
    const padding = points.length === 1 
      ? 160 
      : points.length <= 3 
        ? 130 
        : 110;
        
    const maxZoom = points.length === 1 
      ? 15 
      : points.length <= 3 
        ? 14 
        : 13;
    
    map.fitBounds(bounds, {
      padding: [padding, padding],
      maxZoom: maxZoom
    });
  }, [points, map]);
  
  return null;
};

const LeafletMap = ({ 
  selectedPoints, 
  city, 
  river, 
  hideBusinessNames = false,
  useCache = false 
}: LeafletMapProps) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const hasAutoSelected = useRef(false);
  
  // Hooks de dados geográficos
  const { data: cities = [] } = useCities();
  const selectedCity = cities.find(c => c.name === city);
  const { data: rivers = [] } = useRivers(selectedCity?.id);
  const selectedRiver = rivers.find(r => r.name === river);
  const { data: points = [] } = usePoints(selectedRiver?.id);
  const { data: mapCache } = useMapCache();

  // Determinar se deve usar cache
  const shouldUseCache = useCache && !city && !river && selectedPoints.length === 0;

  // Preparar pontos para exibição
  const displayPoints = useMemo(() => {
    if (shouldUseCache) {
      return (mapCache?.points || []).map(p => ({
        id: p.id,
        name: p.name,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        river_id: p.river_id,
        state: p.state,
      }));
    }

    const allPoints = points.map(p => ({
      ...p,
      state: selectedCity?.state || ''
    }));

    if (selectedPoints.length > 0) {
      return allPoints.filter(p => selectedPoints.includes(p.name));
    }

    return allPoints;
  }, [shouldUseCache, mapCache?.points, selectedPoints, points, selectedCity?.state]);

  // Calcular estados únicos nos pontos
  const statesInPoints = useMemo(() => {
    const states = displayPoints.map(p => p.state).filter(Boolean);
    return [...new Set(states)];
  }, [displayPoints]);

  // Auto-selecionar estado se houver apenas um
  useEffect(() => {
    if (statesInPoints.length === 1 && !hasAutoSelected.current) {
      setSelectedState(statesInPoints[0]);
      hasAutoSelected.current = true;
    } else if (statesInPoints.length !== 1) {
      hasAutoSelected.current = false;
    }
  }, [statesInPoints]);

  // Filtrar pontos por estado selecionado
  const filteredDisplayPoints = useMemo(() => {
    if (!selectedState || statesInPoints.length <= 1) {
      return displayPoints;
    }
    return displayPoints.filter(p => p.state === selectedState);
  }, [displayPoints, selectedState, statesInPoints.length]);

  // Obter metadados do ponto (cidade, rio, estado)
  const getPointMetadata = (pointId: number) => {
    if (shouldUseCache && mapCache?.points) {
      const cachePoint = mapCache.points.find(p => p.id === pointId);
      if (cachePoint) {
        return {
          city: cachePoint.city_name || 'Desconhecido',
          river: cachePoint.river_name || 'Desconhecido',
          state: cachePoint.state || 'Desconhecido'
        };
      }
    }
    
    return {
      city: city || 'Desconhecido',
      river: river || 'Desconhecido',
      state: selectedCity?.state || 'Desconhecido'
    };
  };

  // Calcular centro do mapa
  const getCenterCoordinates = (): [number, number] => {
    const pointsToUse = filteredDisplayPoints.length > 0 
      ? filteredDisplayPoints 
      : displayPoints;
      
    if (pointsToUse.length > 0) {
      const avgLat = pointsToUse.reduce((sum, p) => sum + Number(p.latitude), 0) / pointsToUse.length;
      const avgLng = pointsToUse.reduce((sum, p) => sum + Number(p.longitude), 0) / pointsToUse.length;
      return [avgLat, avgLng];
    }
    
    // Centros predefinidos por cidade
    const cityCenter: Record<string, [number, number]> = {
      'Belém': [-1.4558, -48.4902],
      'default': [-14.235, -51.9253]
    };
    
    return cityCenter[city] || cityCenter['default'];
  };

  // Criar ícone customizado (pin azul em formato de gota)
  const createCustomIcon = () => {
    const svgIcon = `
      <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(14, 28)">
          <circle r="14" fill="white" stroke="#0284c7" stroke-width="2" filter="url(#shadow)" transform="rotate(-45) translate(0, -7)"/>
          <circle r="11" fill="#0284c7" transform="rotate(-45) translate(0, -7)"/>
        </g>
        <circle cx="14" cy="28" r="2" fill="white"/>
      </svg>
    `;

    return L.divIcon({
      className: 'custom-marker-icon',
      html: svgIcon,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      popupAnchor: [0, -40]
    });
  };

  // Determinar quais pontos renderizar
  const pointsToRender = filteredDisplayPoints.length > 0 ? filteredDisplayPoints : displayPoints;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Mapa de Pontos de Coleta
        </CardTitle>
        {city && river && (
          <p className="text-sm text-muted-foreground">
            {city} - {river}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Seletor de estado (apenas se houver múltiplos estados) */}
        {statesInPoints.length > 1 && (
          <div className="mb-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                {statesInPoints.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Container do mapa */}
        <div className="h-96 rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={getCenterCoordinates()}
            zoom={10}
            className="h-full w-full"
            zoomControl={true}
          >
            {/* Camada base: Satélite Esri */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxZoom={19}
              zIndex={1}
            />

            {/* Camada de destaque de rios: Mapa Físico Esri (azul ciano) */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
              maxZoom={19}
              opacity={0.6}
              className="water-highlight-layer"
              zIndex={2}
            />

            {/* Camada de labels de referência (se não estiver oculto) */}
            {!hideBusinessNames && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
                maxZoom={19}
                zIndex={3}
              />
            )}

            {/* Renderizar marcadores */}
            {pointsToRender.map((point) => {
              const lat = Number(point.latitude);
              const lng = Number(point.longitude);
              
              // Validação de coordenadas
              if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.error(`Coordenadas inválidas para ${point.name}:`, { lat, lng });
                return null;
              }
              
              const metadata = getPointMetadata(point.id);
              
              return (
                <Marker
                  key={point.id}
                  position={[lat, lng]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    <div style={{ padding: '12px', fontSize: '14px', minWidth: '200px', textAlign: 'center' }}>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                        {point.name}
                      </strong>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        <div>Lat: {lat.toFixed(4)}</div>
                        <div>Lng: {lng.toFixed(4)}</div>
                        <div style={{ marginTop: '4px', color: '#3b82f6' }}>
                          {metadata.city} - {metadata.river}
                        </div>
                      </div>
                    </div>
                  </Popup>
                  
                  {/* Label permanente ao lado do marcador */}
                  <Tooltip 
                    permanent 
                    direction="right" 
                    offset={[15, -10]}
                    className="permanent-label"
                  >
                    <span>{point.name}</span>
                  </Tooltip>
                </Marker>
              );
            })}

            {/* Ajustar bounds automaticamente */}
            <FitBounds points={pointsToRender} />
          </MapContainer>
        </div>

        {/* Informações sobre pontos exibidos */}
        {pointsToRender.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Exibindo {pointsToRender.length} ponto{pointsToRender.length > 1 ? 's' : ''} de coleta
            {selectedState && statesInPoints.length > 1 && ` - ${selectedState}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeafletMap;
