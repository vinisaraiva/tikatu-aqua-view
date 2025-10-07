import { useQuery } from '@tanstack/react-query';

export interface MapCachePoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  river_id: number;
  river_name: string;
  city_id: number;
  city_name: string;
  state: string;
}

export interface MapCacheBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCache {
  lastUpdated: string;
  totalPoints: number;
  totalRivers: number;
  totalCities: number;
  bounds: MapCacheBounds | null;
  points: MapCachePoint[];
}

export const useMapCache = () => {
  return useQuery<MapCache>({
    queryKey: ['map-cache'],
    queryFn: async () => {
      try {
        const response = await fetch('/data/map-cache.json');
        
        if (!response.ok) {
          // If cache doesn't exist, return empty structure
          console.warn('Map cache file not found, returning empty cache');
          return {
            lastUpdated: new Date().toISOString(),
            totalPoints: 0,
            totalRivers: 0,
            totalCities: 0,
            bounds: null,
            points: []
          };
        }
        
        const data = await response.json();
        console.log('Map cache loaded:', {
          points: data.totalPoints,
          lastUpdated: data.lastUpdated
        });
        
        return data;
      } catch (error) {
        console.error('Error loading map cache:', error);
        // Return empty cache on error
        return {
          lastUpdated: new Date().toISOString(),
          totalPoints: 0,
          totalRivers: 0,
          totalCities: 0,
          bounds: null,
          points: []
        };
      }
    },
    staleTime: Infinity, // Cache never expires
    gcTime: Infinity, // Keep in memory forever
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
