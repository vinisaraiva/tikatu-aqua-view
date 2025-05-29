
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapIcon, AlertCircleIcon } from 'lucide-react';

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
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

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

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-46.6333, -23.5505], // São Paulo center
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        addPointsToMap();
      });
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
    }
  };

  const addPointsToMap = () => {
    if (!map.current) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    selectedPointsData.forEach((point, index) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: hsl(${index * 45}, 70%, 50%);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 8px; font-size: 12px;">
          <strong>${point.name}</strong><br>
          Lat: ${point.lat.toFixed(4)}<br>
          Lng: ${point.lng.toFixed(4)}
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
  };

  useEffect(() => {
    if (isTokenSet && map.current) {
      addPointsToMap();
    }
  }, [selectedPoints, isTokenSet]);

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isTokenSet) {
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="text-sm">
                Para exibir o mapa, você precisa de um token do Mapbox
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Token do Mapbox</Label>
              <div className="flex gap-2">
                <Input
                  id="mapbox-token"
                  type="text"
                  placeholder="Insira seu token público do Mapbox"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                />
                <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()}>
                  Usar Token
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha seu token em{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>

            {selectedPoints.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Pontos Selecionados:</h4>
                <div className="space-y-1">
                  {selectedPointsData.map((point, index) => (
                    <div key={point.id} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
                      />
                      <span>{point.name}</span>
                      <span className="text-gray-500 ml-2">
                        ({point.lat.toFixed(4)}, {point.lng.toFixed(4)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div 
          ref={mapContainer} 
          className="w-full h-80 rounded-lg overflow-hidden border"
        />
        
        {selectedPoints.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Pontos no Mapa:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPointsData.map((point, index) => (
                <div key={point.id} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }}
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
