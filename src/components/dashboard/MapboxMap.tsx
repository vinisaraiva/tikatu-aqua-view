
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  // Determine which points to display
  const displayPoints = shouldUseCache 
    ? (mapCache?.points || []).map(p => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        river_id: p.river_id,
      }))
    : selectedPoints.length > 0 
      ? allPoints.filter(point => selectedPoints.includes(point.name))
      : allPoints; // Show all points from filtered river
  
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
    if (displayPoints.length > 0) {
      // Calculate center from all display points
      const avgLat = displayPoints.reduce((sum, point) => sum + Number(point.latitude), 0) / displayPoints.length;
      const avgLng = displayPoints.reduce((sum, point) => sum + Number(point.longitude), 0) / displayPoints.length;
      return [avgLng, avgLat];
    }
    
    // If using cache and bounds available, use center of bounds
    if (shouldUseCache && mapCache?.bounds) {
      const centerLng = (mapCache.bounds.east + mapCache.bounds.west) / 2;
      const centerLat = (mapCache.bounds.north + mapCache.bounds.south) / 2;
      return [centerLng, centerLat];
    }
    
    // Default city centers for fallback
    const cityCenters: { [key: string]: [number, number] } = {
      'PORTO SEGURO': [-39.05, -16.40],
      'São Paulo': [-46.6333, -23.5505],
      'Rio de Janeiro': [-43.1833, -22.5167],
      'Belo Horizonte': [-43.9345, -19.9167],
      'Brasília': [-48.1297, -15.7975]
    };
    
    return cityCenters[city] || [-39.2778, -15.6014]; // Sul da Bahia como padrão
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

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

      console.log('Creating new map for city:', city, 'with center:', getCenterCoordinates());

      // Choose map style based on hideBusinessNames prop
      const mapStyle = hideBusinessNames 
        ? 'mapbox://styles/mapbox/outdoors-v12' 
        : 'mapbox://styles/mapbox/outdoors-v12';

      // Create new map with dynamic center based on city or cache
      const initialZoom = shouldUseCache && mapCache?.bounds ? 10 : 12;
      
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
        console.log('Map loaded successfully for city:', city);
        
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
  }, [city, river, hideBusinessNames, shouldUseCache, mapCache]); // Re-initialize map when filters or cache changes

  // Add markers when map is loaded and points are available
  useEffect(() => {
    if (!map.current || !isMapLoaded || displayPoints.length === 0) return;

    console.log('Adding markers for points:', displayPoints.map(p => ({ name: p.name, river_id: p.river_id })));
    console.log('Using cache mode:', shouldUseCache);

    // Clear existing markers
    clearMarkers();

    // Add markers for display points
    displayPoints.forEach((point) => {
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

      // Create and add marker with explicit type casting
      const coordinates: [number, number] = [Number(point.longitude), Number(point.latitude)];
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

    // Fit bounds to show all points
    if (displayPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      displayPoints.forEach(point => {
        const coordinates: [number, number] = [Number(point.longitude), Number(point.latitude)];
        bounds.extend(coordinates);
      });
      
      // Add padding and adjust zoom based on number of points
      const maxZoom = displayPoints.length === 1 ? 15 : displayPoints.length <= 3 ? 14 : shouldUseCache ? 10 : 13;
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom
      });
    }
  }, [selectedPoints, isMapLoaded, city, river, displayPoints, shouldUseCache]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
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
        {mapError ? (
          <div className="w-full h-80 rounded-lg border flex items-center justify-center bg-gray-100">
            <p className="text-red-600">{mapError}</p>
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
