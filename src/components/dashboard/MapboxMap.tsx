
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';

interface CollectionPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface MapboxMapProps {
  selectedPoints: string[];
  city: string;
  river: string;
}

const MapboxMap = ({ selectedPoints, city, river }: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Coordinates mapping by city and river with collection points
  const cityRiverPoints = {
    'São Paulo': {
      'Rio Tietê': [
        { id: 'Ponto SP-TIE-001', name: 'Ponto SP-TIE-001', lat: -23.5505, lng: -46.6333 },
        { id: 'Ponto SP-TIE-002', name: 'Ponto SP-TIE-002', lat: -23.5515, lng: -46.6343 },
        { id: 'Ponto SP-TIE-003', name: 'Ponto SP-TIE-003', lat: -23.5525, lng: -46.6353 },
        { id: 'Ponto SP-TIE-004', name: 'Ponto SP-TIE-004', lat: -23.5535, lng: -46.6363 }
      ],
      'Rio Pinheiros': [
        { id: 'Ponto SP-PIN-001', name: 'Ponto SP-PIN-001', lat: -23.5629, lng: -46.6544 },
        { id: 'Ponto SP-PIN-002', name: 'Ponto SP-PIN-002', lat: -23.5639, lng: -46.6554 },
        { id: 'Ponto SP-PIN-003', name: 'Ponto SP-PIN-003', lat: -23.5649, lng: -46.6564 }
      ],
      'Rio Tamanduateí': [
        { id: 'Ponto SP-TAM-001', name: 'Ponto SP-TAM-001', lat: -23.5431, lng: -46.6097 },
        { id: 'Ponto SP-TAM-002', name: 'Ponto SP-TAM-002', lat: -23.5441, lng: -46.6107 }
      ]
    },
    'Rio de Janeiro': {
      'Rio Guandu': [
        { id: 'Ponto RJ-GUA-001', name: 'Ponto RJ-GUA-001', lat: -22.8305, lng: -43.4428 },
        { id: 'Ponto RJ-GUA-002', name: 'Ponto RJ-GUA-002', lat: -22.8315, lng: -43.4438 },
        { id: 'Ponto RJ-GUA-003', name: 'Ponto RJ-GUA-003', lat: -22.8325, lng: -43.4448 }
      ],
      'Rio Paraíba do Sul': [
        { id: 'Ponto RJ-PAR-001', name: 'Ponto RJ-PAR-001', lat: -22.5167, lng: -43.1833 },
        { id: 'Ponto RJ-PAR-002', name: 'Ponto RJ-PAR-002', lat: -22.5177, lng: -43.1843 },
        { id: 'Ponto RJ-PAR-003', name: 'Ponto RJ-PAR-003', lat: -22.5187, lng: -43.1853 },
        { id: 'Ponto RJ-PAR-004', name: 'Ponto RJ-PAR-004', lat: -22.5197, lng: -43.1863 },
        { id: 'Ponto RJ-PAR-005', name: 'Ponto RJ-PAR-005', lat: -22.5207, lng: -43.1873 }
      ]
    },
    'Belo Horizonte': {
      'Rio das Velhas': [
        { id: 'Ponto BH-VEL-001', name: 'Ponto BH-VEL-001', lat: -19.9167, lng: -43.9345 },
        { id: 'Ponto BH-VEL-002', name: 'Ponto BH-VEL-002', lat: -19.9177, lng: -43.9355 },
        { id: 'Ponto BH-VEL-003', name: 'Ponto BH-VEL-003', lat: -19.9187, lng: -43.9365 }
      ],
      'Rio Arrudas': [
        { id: 'Ponto BH-ARR-001', name: 'Ponto BH-ARR-001', lat: -19.9208, lng: -43.9378 },
        { id: 'Ponto BH-ARR-002', name: 'Ponto BH-ARR-002', lat: -19.9218, lng: -43.9388 }
      ]
    },
    'Brasília': {
      'Rio Descoberto': [
        { id: 'Ponto DF-DES-001', name: 'Ponto DF-DES-001', lat: -15.7975, lng: -48.1297 },
        { id: 'Ponto DF-DES-002', name: 'Ponto DF-DES-002', lat: -15.7985, lng: -48.1307 },
        { id: 'Ponto DF-DES-003', name: 'Ponto DF-DES-003', lat: -15.7995, lng: -48.1317 }
      ],
      'Rio Paranoá': [
        { id: 'Ponto DF-PAR-001', name: 'Ponto DF-PAR-001', lat: -15.7801, lng: -47.8069 },
        { id: 'Ponto DF-PAR-002', name: 'Ponto DF-PAR-002', lat: -15.7811, lng: -47.8079 }
      ]
    }
  };

  // Get collection points for the selected city and river
  const availablePoints = city && river ? cityRiverPoints[city]?.[river] || [] : [];
  
  // Filter points based on selected points
  const selectedPointsData = availablePoints.filter(point => 
    selectedPoints.includes(point.id)
  );

  console.log('MapboxMap - City:', city, 'River:', river, 'Selected Points:', selectedPoints);
  console.log('MapboxMap - Available Points:', availablePoints.map(p => p.id));
  console.log('MapboxMap - Selected Points Data:', selectedPointsData.map(p => p.id));

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
  const getCenterCoordinates = () => {
    if (selectedPointsData.length > 0) {
      // Use the first point as center
      return [selectedPointsData[0].lng, selectedPointsData[0].lat];
    }
    
    // Default city centers
    const cityCenters = {
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

      // Create new map with dynamic center based on city
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
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
  }, [city, river]); // Re-initialize map when city or river changes

  // Add markers when map is loaded and points are selected
  useEffect(() => {
    if (!map.current || !isMapLoaded || selectedPointsData.length === 0) return;

    console.log('Adding markers for points:', selectedPointsData.map(p => p.id));

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
            <div>Lat: ${point.lat.toFixed(4)}</div>
            <div>Lng: ${point.lng.toFixed(4)}</div>
            <div style="margin-top: 4px; color: #3b82f6;">${city} - ${river}</div>
          </div>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([point.lng, point.lat])
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
        bounds.extend([point.lng, point.lat]);
      });
      
      // Add padding and ensure minimum zoom
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 15
      });
    }
  }, [selectedPoints, isMapLoaded, city, river]);

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
