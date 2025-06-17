
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface State {
  state: string;
  count: number;
}

export interface City {
  id: number;
  name: string;
  state: string;
}

export interface River {
  id: number;
  city_id: number;
  name: string;
}

export interface Point {
  id: number;
  river_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: async (): Promise<State[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('state')
        .not('state', 'is', null)
        .order('state');
      
      if (error) throw error;
      
      // Group by state and count cities
      const stateGroups = (data || []).reduce((acc: Record<string, number>, city) => {
        acc[city.state] = (acc[city.state] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(stateGroups).map(([state, count]) => ({
        state,
        count
      }));
    }
  });
};

export const useCities = (selectedState?: string) => {
  return useQuery({
    queryKey: ['cities', selectedState],
    queryFn: async (): Promise<City[]> => {
      let query = supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (selectedState) {
        query = query.eq('state', selectedState);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useRivers = (cityId?: number) => {
  return useQuery({
    queryKey: ['rivers', cityId],
    queryFn: async (): Promise<River[]> => {
      let query = supabase
        .from('rivers')
        .select('*')
        .order('name');
      
      if (cityId) {
        query = query.eq('city_id', cityId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!cityId
  });
};

export const usePoints = (riverId?: number) => {
  return useQuery({
    queryKey: ['points', riverId],
    queryFn: async (): Promise<Point[]> => {
      if (!riverId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('river_id', riverId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!riverId
  });
};
