
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

  // Mock collection points with real coordinates (São Paulo area)
  const collectionPoints: CollectionPoint[] = [
    { id: 'Ponto 001', name: 'Ponto 001 - Centro', lat: -23.5505, lng: -46.6333 },
    { id: 'Ponto 002', name: 'Ponto 002 - Vila Madalena', lat: -23.5515, lng: -46.6343 },
    { id: 'Ponto 003', name: 'Ponto 003 - Pinheiros', lat: -23.5525, lng: -46.6353 },
    { id: 'Ponto 004', name: 'Ponto 004 - Moema', lat: -23.5535, lng: -46.6363 },
    { id: 'Ponto 005', name: 'Ponto 005 - Itaim Bibi', lat: -23.5545, lng: -46.6373 },
  ];

  const selectedPointsData = collectionPoints.filter(point => 
    selectedPoints.includes(point.id)
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = 'pk.eyJ1IjoidmluaXNhcmFpdmEiLCJhIjoiY20wb25ocG9hMGF1ZTJrbzlmZm5haWFlcyJ9.XnczMEcsq_NTNTOFeCxzxA';

      console.log('Initializing Mapbox with outdoors style...');

      // Initialize map with outdoors style that shows rivers and natural features clearly
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-46.6333, -23.5505], // São Paulo center
        zoom: 12,
      });

      // Add event listeners for debugging
      map.current.on('load', () => {
        console.log('Map loaded successfully with outdoors style');
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Erro ao carregar o mapa. Verifique sua conexão.');
      });

      map.current.on('styledata', () => {
        console.log('Style data loaded');
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Erro ao inicializar o mapa.');
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.custom-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for selected points
    selectedPointsData.forEach((point, index) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #06b6d4;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
        position: relative;
      `;

      // Add a small inner circle for better visibility
      const innerCircle = document.createElement('div');
      innerCircle.style.cssText = `
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
      markerElement.appendChild(innerCircle);

      // Create popup for hover
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 12px; font-size: 14px; min-width: 200px;">
          <strong style="color: #0f172a;">${point.name}</strong><br>
          <span style="color: #64748b;">Latitude: ${point.lat.toFixed(4)}</span><br>
          <span style="color: #64748b;">Longitude: ${point.lng.toFixed(4)}</span>
        </div>
      `);

      // Create marker
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
    });

    // Fit map to show all points
    if (selectedPointsData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      selectedPointsData.forEach(point => {
        bounds.extend([point.lng, point.lat]);
      });
      map.current!.fitBounds(bounds, { padding: 50 });
    }
  }, [selectedPoints]);

  return (
    <Card>
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
              {selectedPointsData.map((point, index) => (
                <div key={point.id} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 border border-white" 
                    style={{ backgroundColor: '#06b6d4' }}
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
