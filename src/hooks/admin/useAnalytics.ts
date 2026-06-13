import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export interface PageViewRow {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  duration_seconds: number;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgDurationSeconds: number;
  topPath: string | null;
}

export interface CountItem {
  name: string;
  value: number;
}

export interface DailyPoint {
  date: string;
  label: string;
  views: number;
  visitors: number;
}

export interface LocationItem {
  country: string;
  region: string;
  views: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  daily: DailyPoint[];
  topPages: CountItem[];
  devices: CountItem[];
  browsers: CountItem[];
  locations: LocationItem[];
  total: number;
}

const tallyTop = (
  rows: PageViewRow[],
  key: keyof PageViewRow,
  fallback = 'Desconhecido',
): CountItem[] => {
  const map = new Map<string, number>();
  for (const r of rows) {
    const raw = (r[key] as string | null) ?? fallback;
    const name = raw || fallback;
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const useAnalytics = (days: number) => {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', days],
    queryFn: async () => {
      const since = startOfDay(subDays(new Date(), days - 1)).toISOString();

      const { data, error } = await supabase
        .from('page_views' as never)
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(10000);

      if (error) throw error;

      const rows = (data ?? []) as unknown as PageViewRow[];

      // Resumo
      const totalViews = rows.length;
      const uniqueVisitors = new Set(rows.map((r) => r.session_id)).size;
      const totalDuration = rows.reduce((acc, r) => acc + (r.duration_seconds || 0), 0);
      const avgDurationSeconds = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

      const topPages = tallyTop(rows, 'path');
      const devices = tallyTop(rows, 'device_type');
      const browsers = tallyTop(rows, 'browser');

      // Visitas por dia
      const dailyMap = new Map<string, { views: number; visitors: Set<string> }>();
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(d, { views: 0, visitors: new Set() });
      }
      for (const r of rows) {
        const d = format(new Date(r.created_at), 'yyyy-MM-dd');
        const entry = dailyMap.get(d);
        if (entry) {
          entry.views += 1;
          entry.visitors.add(r.session_id);
        }
      }
      const daily: DailyPoint[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
        date,
        label: format(new Date(date), 'dd/MM'),
        views: v.views,
        visitors: v.visitors.size,
      }));

      // Localidades
      const locMap = new Map<string, LocationItem>();
      for (const r of rows) {
        const country = r.country ?? 'Desconhecido';
        const region = r.region ?? '';
        const key = `${country}|${region}`;
        const existing = locMap.get(key);
        if (existing) {
          existing.views += 1;
        } else {
          locMap.set(key, { country, region, views: 1 });
        }
      }
      const locations = Array.from(locMap.values()).sort((a, b) => b.views - a.views);

      return {
        summary: {
          totalViews,
          uniqueVisitors,
          avgDurationSeconds,
          topPath: topPages[0]?.name ?? null,
        },
        daily,
        topPages: topPages.slice(0, 8),
        devices,
        browsers: browsers.slice(0, 6),
        locations: locations.slice(0, 10),
        total: totalViews,
      };
    },
  });
};

export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};
