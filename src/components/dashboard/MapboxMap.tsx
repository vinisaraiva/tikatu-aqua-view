
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';
import { usePoints, useRivers, useCities } from '@/hooks/useGeographicData';

interface MapboxMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
  hideBusinessNames?: boolean;
}

const MapboxMap = ({ selectedPoints, city, river, hideBusinessNames = false }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch data with proper filtering
  const { data: cities = [] } = useCities();
  const selectedCityData = cities.find(c => c.name === city);
  const { data: rivers = [] } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(r => r.name === river);
  const { data: allPoints = [] } = usePoints(selectedRiverData?.id);
  
  // Filter points based on selected points AND river
  const selectedPointsData = allPoints.filter(point => 
    selectedPoints.includes(point.name)
  );

  console.log('MapboxMap - City:', city, 'River:', river, 'Selected Points:', selectedPoints);
  console.log('MapboxMap - River ID:', selectedRiverData?.id);
  console.log('MapboxMap - Available Points for this river:', allPoints.map(p => ({ name: p.name, river_id: p.river_id })));
  console.log('MapboxMap - Selected Points Data:', selectedPointsData.map(p => ({ name: p.name, river_id: p.river_id })));

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
    if (selectedPointsData.length > 0) {
      // Calculate center from all selected points
      const avgLat = selectedPointsData.reduce((sum, point) => sum + Number(point.latitude), 0) / selectedPointsData.length;
      const avgLng = selectedPointsData.reduce((sum, point) => sum + Number(point.longitude), 0) / selectedPointsData.length;
      return [avgLng, avgLat];
    }
    
    // Default city centers for fallback
    const cityCenters: { [key: string]: [number, number] } = {
      'PORTO SEGURO': [-39.05, -16.40],
      'São Paulo': [-46.6333, -23.5505],
      'Rio de Janeiro': [-43.1833, -22.5167],
      'Belo Horizonte': [-43.9345, -19.9167],
      'Brasília': [-48.1297, -15.7975]
    };
    
    return cityCenters[city] || [-46.6333, -23.5505];
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

      // Create new map with dynamic center based on city
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: getCenterCoordinates(),
        zoom: 12,
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
  }, [city, river, hideBusinessNames]); // Re-initialize map when city, river, or hideBusinessNames changes

  // Add markers when map is loaded and points are selected
  useEffect(() => {
    if (!map.current || !isMapLoaded || selectedPointsData.length === 0) return;

    console.log('Adding markers for points:', selectedPointsData.map(p => ({ name: p.name, river_id: p.river_id })));

    // Clear existing markers
    clearMarkers();

    // Add markers for selected points
    selectedPointsData.forEach((point) => {
      // Create droplet marker element
      const markerElement = createDropletMarker();

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
            <div style="margin-top: 4px; color: #3b82f6;">${city} - ${river}</div>
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
    if (selectedPointsData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      selectedPointsData.forEach(point => {
        const coordinates: [number, number] = [Number(point.longitude), Number(point.latitude)];
        bounds.extend(coordinates);
      });
      
      // Add padding and ensure minimum zoom
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 15
      });
    }
  }, [selectedPoints, isMapLoaded, city, river, selectedPointsData]);

  return (
    <Card className="w-full">
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
        
        {selectedPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Pontos no Mapa:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPointsData.map((point) => (
                <div key={point.id} className="flex items-center text-sm">
                  <div 
                    className="w-4 h-5 mr-2 relative flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      borderRadius: '50% 50% 50% 0',
                      transform: 'rotate(-45deg)',
                      border: '1px solid white'
                    }}
                  />
                  <span className="font-medium">{point.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxMap;
