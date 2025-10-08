import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapIcon } from 'lucide-react';
import { usePoints, useRivers, useCities } from '@/hooks/useGeographicData';
import { useMapCache } from '@/hooks/useMapCache';

interface MapboxMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
  hideBusinessNames?: boolean;
  useCache?: boolean;
}

const MapboxMap = ({ selectedPoints, city, river, hideBusinessNames = false, useCache = true }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Load cache data
  const { data: mapCache } = useMapCache();
  
  // Determine if we should use cache: only if cache is enabled AND no filters are active
  const shouldUseCache = useCache && !city && !river && selectedPoints.length === 0;
  
  // Fetch data with proper filtering (only when not using cache)
  const { data: cities = [] } = useCities();
  const selectedCityData = cities.find(c => c.name === city);
  const { data: rivers = [] } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(r => r.name === river);
  const { data: allPoints = [] } = usePoints(selectedRiverData?.id);
  
  // Memoize displayPoints to prevent recalculation on every render
  const displayPoints = useMemo(() => {
    return shouldUseCache 
      ? (mapCache?.points || []).map(p => ({
          id: p.id,
          name: p.name,
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          river_id: p.river_id,
          state: p.state,
        }))
      : (selectedPoints.length > 0 
        ? allPoints.filter(point => selectedPoints.includes(point.name))
        : allPoints
      ).map(p => ({
          id: p.id,
          name: p.name,
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          river_id: p.river_id,
          state: undefined,
        }));
  }, [shouldUseCache, mapCache?.points, selectedPoints, allPoints]);

  // Detectar estados diferentes nos pontos
  const statesInPoints = useMemo(() => {
    const states = displayPoints
      .map(p => p.state)
      .filter((state): state is string => state !== undefined && state !== null);
    return [...new Set(states)];
  }, [displayPoints]);

  // Auto-selecionar o primeiro estado se houver múltiplos e nenhum selecionado
  useEffect(() => {
    if (statesInPoints.length > 1 && !selectedState) {
      setSelectedState(statesInPoints[0]);
    } else if (statesInPoints.length === 1) {
      setSelectedState(null); // Reset if only one state
    }
  }, [statesInPoints, selectedState]);

  // Filtrar pontos pelo estado selecionado
  const filteredDisplayPoints = useMemo(() => {
    if (!selectedState || statesInPoints.length <= 1) {
      return displayPoints;
    }
    
    return displayPoints.filter(p => p.state === selectedState);
  }, [displayPoints, selectedState, statesInPoints]);
  
  // For cache mode, we need city and river names from cache
  const getPointMetadata = (pointName: string) => {
    if (shouldUseCache && mapCache) {
      const cachePoint = mapCache.points.find(p => p.name === pointName);
      return {
        city: cachePoint?.city_name || 'Desconhecido',
        river: cachePoint?.river_name || 'Desconhecido'
      };
    }
    return { city, river };
  };

  console.log('MapboxMap - City:', city, 'River:', river, 'Selected Points:', selectedPoints);
  console.log('MapboxMap - River ID:', selectedRiverData?.id);
  console.log('MapboxMap - Available Points for this river:', allPoints.map(p => ({ name: p.name, river_id: p.river_id })));
  console.log('MapboxMap - Display Points:', displayPoints.map(p => ({ name: p.name, river_id: p.river_id })));
  console.log('MapboxMap - States in points:', statesInPoints);
  console.log('MapboxMap - Selected state:', selectedState);
  console.log('MapboxMap - Filtered Display Points:', filteredDisplayPoints.map(p => ({ name: p.name, state: p.state })));

  // Create droplet-style marker element
  const createDropletMarker = () => {
    const markerElement = document.createElement('div');
    markerElement.className = 'droplet-marker';
    markerElement.style.cssText = `
      width: 30px;
      height: 40px;
      position: relative;
      cursor: pointer;
      transform: translate(-50%, -100%);
    `;

    // Create the droplet shape using CSS
    const droplet = document.createElement('div');
    droplet.style.cssText = `
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      position: absolute;
      top: 8px;
      left: 0;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
      border: 2px solid white;
    `;

    // Create inner highlight
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      position: absolute;
      top: 6px;
      left: 6px;
    `;

    droplet.appendChild(highlight);
    markerElement.appendChild(droplet);

    return markerElement;
  };

  // Remove all existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Get center coordinates for the selected city/river
  const getCenterCoordinates = (): [number, number] => {
    const pointsToUse = filteredDisplayPoints.length > 0 ? filteredDisplayPoints : displayPoints;
    console.log('🎯 getCenterCoordinates chamado. pointsToUse.length:', pointsToUse.length);
    
    if (pointsToUse.length > 0) {
      // Calculate center from all display points
      const avgLat = pointsToUse.reduce((sum, point) => sum + Number(point.latitude), 0) / pointsToUse.length;
      const avgLng = pointsToUse.reduce((sum, point) => sum + Number(point.longitude), 0) / pointsToUse.length;
      
      console.log('📍 Centro calculado dos pontos:', { avgLng, avgLat, coordinates: [avgLng, avgLat] });
      console.log('📊 Pontos usados para cálculo:', pointsToUse.map(p => ({
        name: p.name,
        lat: Number(p.latitude),
        lng: Number(p.longitude),
        state: p.state
      })));
      
      return [avgLng, avgLat];
    }
    
    // Default city centers for fallback (when no points available)
    const cityCenters: { [key: string]: [number, number] } = {
      'PORTO SEGURO': [-39.05, -16.40],
      'São Paulo': [-46.6333, -23.5505],
      'Rio de Janeiro': [-43.1833, -22.5167],
      'Belo Horizonte': [-43.9345, -19.9167],
      'Brasília': [-48.1297, -15.7975]
    };
    
    const defaultCenter = cityCenters[city] || [-39.05, -16.40]; // Porto Seguro como padrão
    console.log('⚠️ Nenhum ponto disponível, usando centro padrão:', defaultCenter);
    return defaultCenter;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Wait for cache to load if we're using it
    if (shouldUseCache && !mapCache) {
      console.log('⏳ Aguardando carregamento do cache...');
      return;
    }

    // Wait for points to be available (use filtered if multiple states)
    const pointsToCheck = statesInPoints.length > 1 ? filteredDisplayPoints : displayPoints;
    if (pointsToCheck.length === 0) {
      console.log('⏳ Aguardando pontos disponíveis...');
      return;
    }

    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    clearMarkers();
    setIsMapLoaded(false);

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = 'pk.eyJ1IjoidmluaXNhcmFpdmEiLCJhIjoiY20wb25ocG9hMGF1ZTJrbzlmZm5haWFlcyJ9.XnczMEcsq_NTNTOFeCxzxA';

      const pointsToUse = filteredDisplayPoints.length > 0 ? filteredDisplayPoints : displayPoints;
      console.log('✅ Criando mapa com', pointsToUse.length, 'pontos disponíveis (filtrados)');
      console.log('Centro do mapa:', getCenterCoordinates());

      // Choose map style based on hideBusinessNames prop
      const mapStyle = hideBusinessNames 
        ? 'mapbox://styles/mapbox/outdoors-v12' 
        : 'mapbox://styles/mapbox/outdoors-v12';

      // Create new map with dynamic center based on city or cache
      const initialZoom = pointsToUse.length === 1 ? 15 : pointsToUse.length <= 3 ? 14 : 10;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: getCenterCoordinates(),
        zoom: initialZoom,
        preserveDrawingBuffer: true,
        antialias: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Map load event
      map.current.on('load', () => {
        console.log('🗺️ Mapa carregado com sucesso');
        
        // Hide business labels if requested
        if (hideBusinessNames && map.current) {
          // Hide POI labels
          const layers = map.current.getStyle().layers;
          layers?.forEach((layer) => {
            if (layer.id.includes('poi') || layer.id.includes('label') || layer.id.includes('place')) {
              if (layer.type === 'symbol' && layer.id.includes('poi')) {
                map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
              }
            }
          });
        }
        
        setIsMapLoaded(true);
        setMapError(null);
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Erro ao carregar o mapa');
      });

    } catch (error) {
      console.error('Error creating map:', error);
      setMapError('Erro ao inicializar o mapa');
    }

    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [city, river, hideBusinessNames, shouldUseCache, mapCache, selectedState, filteredDisplayPoints]); // Re-initialize map when filters or cache changes

  // Add markers when map is loaded and points are available
  useEffect(() => {
    const pointsToRender = filteredDisplayPoints.length > 0 ? filteredDisplayPoints : displayPoints;
    if (!map.current || !isMapLoaded || pointsToRender.length === 0) return;

    console.log('Adding markers for points:', pointsToRender.map(p => ({ name: p.name, river_id: p.river_id, state: p.state })));
    console.log('Using cache mode:', shouldUseCache);

    // Clear existing markers
    clearMarkers();

    // Add markers for display points
    pointsToRender.forEach((point) => {
      // Create droplet marker element
      const markerElement = createDropletMarker();

      // Get metadata for this point
      const metadata = getPointMetadata(point.name);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: [0, -40],
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 12px; font-size: 14px; min-width: 200px; text-align: center;">
          <strong style="color: #0f172a; display: block; margin-bottom: 8px;">${point.name}</strong>
          <div style="color: #64748b; font-size: 12px;">
            <div>Lat: ${Number(point.latitude).toFixed(4)}</div>
            <div>Lng: ${Number(point.longitude).toFixed(4)}</div>
            <div style="margin-top: 4px; color: #3b82f6;">${metadata.city} - ${metadata.river}</div>
          </div>
        </div>
      `);

      // Validate coordinates before creating marker
      const lat = Number(point.latitude);
      const lng = Number(point.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`❌ Coordenadas inválidas para ponto ${point.name}:`, { 
          lat, 
          lng, 
          original: point 
        });
        return;
      }

      // Additional validation for reasonable coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error(`❌ Coordenadas fora do range válido para ponto ${point.name}:`, { 
          lat, 
          lng,
          validRange: 'lat: -90 a 90, lng: -180 a 180'
        });
        return;
      }

      // Create and add marker with validated coordinates
      const coordinates: [number, number] = [lng, lat];
      
      console.log(`🔵 Criando marker para ${point.name}:`, {
        name: point.name,
        lat: lat,
        lng: lng,
        coordinates: coordinates,
        original: { latitude: point.latitude, longitude: point.longitude }
      });
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      markerElement.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Store marker reference
      markersRef.current.push(marker);
    });

    // Fit bounds to show all points with a slight delay to ensure markers are rendered
    if (pointsToRender.length > 0) {
      setTimeout(() => {
        const bounds = new mapboxgl.LngLatBounds();
        
        console.log('📐 Calculando bounds para os pontos:');
        pointsToRender.forEach(point => {
          const lng = Number(point.longitude);
          const lat = Number(point.latitude);
          const coordinates: [number, number] = [lng, lat];
          
          console.log(`📐 Bounds coordinate para ${point.name}:`, {
            name: point.name,
            lng: lng,
            lat: lat,
            coordinates: coordinates,
            state: point.state
          });
          
          bounds.extend(coordinates);
        });
        
        // Add padding and adjust zoom based on number of points
        const maxZoom = pointsToRender.length === 1 ? 15 : pointsToRender.length <= 3 ? 14 : shouldUseCache ? 10 : 13;
        
        if (map.current) {
          const boundsData = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          
          console.log('🎯 Ajustando bounds do mapa:', {
            totalPontos: pointsToRender.length,
            bounds: boundsData,
            maxZoom: maxZoom,
            estadoSelecionado: selectedState
          });
          
          map.current.fitBounds(bounds, { 
            padding: 80,
            maxZoom,
            duration: 1000
          });
        }
      }, 100);
    }
  }, [selectedPoints, isMapLoaded, city, river, displayPoints, filteredDisplayPoints, shouldUseCache]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapIcon className="h-5 w-5" />
          Mapa dos Pontos de Coleta
        </CardTitle>
        {city && river && (
          <p className="text-sm text-muted-foreground">
            {city} → {river}
          </p>
        )}
        {statesInPoints.length > 1 && (
          <div className="mt-4">
            <Select value={selectedState || ''} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[200px]">
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
            <p className="text-xs text-muted-foreground mt-2">
              Pontos em múltiplos estados detectados. Selecione para filtrar.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {mapError ? (
          <div className="w-full h-80 rounded-lg border flex items-center justify-center bg-muted">
            <p className="text-destructive">{mapError}</p>
          </div>
        ) : (
          <div 
            ref={mapContainer} 
            className="w-full h-80 rounded-lg overflow-hidden border"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxMap;
