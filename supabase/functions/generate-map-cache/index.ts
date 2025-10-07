import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Point {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  river_id: number;
}

interface River {
  id: number;
  name: string;
  city_id: number;
}

interface City {
  id: number;
  name: string;
  state: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem gerar o cache' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating map cache...');

    // Fetch all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (citiesError) throw citiesError;

    // Fetch all rivers
    const { data: rivers, error: riversError } = await supabase
      .from('rivers')
      .select('*')
      .order('name');

    if (riversError) throw riversError;

    // Fetch all points
    const { data: points, error: pointsError } = await supabase
      .from('points')
      .select('*')
      .order('name');

    if (pointsError) throw pointsError;

    console.log(`Fetched ${cities?.length || 0} cities, ${rivers?.length || 0} rivers, ${points?.length || 0} points`);

    // Build enriched points data
    const enrichedPoints = (points as Point[]).map(point => {
      const river = (rivers as River[]).find(r => r.id === point.river_id);
      const city = river ? (cities as City[]).find(c => c.id === river.city_id) : null;

      return {
        id: point.id,
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        river_id: point.river_id,
        river_name: river?.name || 'Unknown',
        city_id: city?.id || 0,
        city_name: city?.name || 'Unknown',
        state: city?.state || 'Unknown'
      };
    });

    // Calculate bounds
    let bounds = null;
    if (enrichedPoints.length > 0) {
      const latitudes = enrichedPoints.map(p => Number(p.latitude));
      const longitudes = enrichedPoints.map(p => Number(p.longitude));

      bounds = {
        north: Math.max(...latitudes),
        south: Math.min(...latitudes),
        east: Math.max(...longitudes),
        west: Math.min(...longitudes)
      };
    }

    // Build cache object
    const cacheData = {
      lastUpdated: new Date().toISOString(),
      totalPoints: enrichedPoints.length,
      totalRivers: rivers?.length || 0,
      totalCities: cities?.length || 0,
      bounds,
      points: enrichedPoints
    };

    console.log('Cache generated successfully:', {
      points: cacheData.totalPoints,
      rivers: cacheData.totalRivers,
      cities: cacheData.totalCities,
      bounds: cacheData.bounds
    });

    return new Response(
      JSON.stringify(cacheData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating map cache:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
