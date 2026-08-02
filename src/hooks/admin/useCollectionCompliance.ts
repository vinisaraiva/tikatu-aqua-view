import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ComplianceStatus = 'on_time' | 'off_window' | 'missed';

export interface ComplianceItem {
  key: string;
  schedule_id: string;
  volunteer_id: number;
  volunteer_name: string;
  volunteer_code: string;
  point_id: number;
  point_name: string;
  date: string;
  scheduled_time: string;
  status: ComplianceStatus;
  measured_at?: string;
  has_push: boolean;
}

const toLocalDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const timeToMinutes = (value: string) => {
  const [h, m] = value.split(':');
  return Number(h) * 60 + Number(m);
};

export const useCollectionCompliance = (days = 7) => {
  return useQuery({
    queryKey: ['collection-compliance', days],
    queryFn: async (): Promise<ComplianceItem[]> => {
      const [schedulesRes, volunteersRes, pointsRes, subsRes] = await Promise.all([
        supabase
          .from('volunteer_schedules')
          .select('id, volunteer_id, point_id, weekdays, scheduled_time, tolerance_minutes')
          .eq('is_active', true),
        supabase.from('volunteers').select('id, code, nome, is_active'),
        supabase.from('points').select('id, name'),
        supabase.from('volunteer_push_subscriptions').select('volunteer_id'),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (volunteersRes.error) throw volunteersRes.error;

      const schedules = schedulesRes.data || [];
      if (schedules.length === 0) return [];

      const volunteers = new Map((volunteersRes.data || []).map((v: any) => [v.id, v]));
      const pointNames = new Map((pointsRes.data || []).map((p: any) => [p.id, p.name]));
      const pushVolunteers = new Set((subsRes.data || []).map((s: any) => s.volunteer_id));

      const start = new Date();
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);

      const { data: readings, error: readingsError } = await supabase
        .from('readings')
        .select('volunteer_id, point_id, measured_at')
        .gte('measured_at', start.toISOString())
        .not('volunteer_id', 'is', null);

      if (readingsError) throw readingsError;

      const readingMap = new Map<string, string[]>();
      (readings || []).forEach((r: any) => {
        const key = `${r.volunteer_id}:${r.point_id}:${toLocalDateKey(new Date(r.measured_at))}`;
        readingMap.set(key, [...(readingMap.get(key) || []), r.measured_at]);
      });

      const items: ComplianceItem[] = [];
      const now = new Date();

      for (let offset = 0; offset < days; offset++) {
        const day = new Date();
        day.setDate(day.getDate() - offset);
        day.setHours(0, 0, 0, 0);
        const dateKey = toLocalDateKey(day);
        const weekday = day.getDay();

        for (const schedule of schedules) {
          const weekdays: number[] = (schedule.weekdays as any) || [];
          if (!weekdays.includes(weekday)) continue;

          const volunteer = volunteers.get(schedule.volunteer_id);
          if (!volunteer || volunteer.is_active === false) continue;

          const scheduledTime = String(schedule.scheduled_time).slice(0, 5);
          const tolerance = schedule.tolerance_minutes ?? 60;
          const target = timeToMinutes(scheduledTime);

          // ignora ocorrências futuras de hoje ainda dentro da tolerância
          if (offset === 0) {
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            if (nowMinutes < target + tolerance) continue;
          }

          const readingTimes = readingMap.get(`${schedule.volunteer_id}:${schedule.point_id}:${dateKey}`) || [];

          let status: ComplianceStatus = 'missed';
          let measured_at: string | undefined;

          if (readingTimes.length > 0) {
            measured_at = readingTimes[0];
            const inWindow = readingTimes.some((iso) => {
              const d = new Date(iso);
              const minutes = d.getHours() * 60 + d.getMinutes();
              return Math.abs(minutes - target) <= tolerance;
            });
            status = inWindow ? 'on_time' : 'off_window';
          }

          items.push({
            key: `${schedule.id}-${dateKey}`,
            schedule_id: schedule.id,
            volunteer_id: schedule.volunteer_id,
            volunteer_name: volunteer.nome || volunteer.code,
            volunteer_code: volunteer.code,
            point_id: schedule.point_id,
            point_name: pointNames.get(schedule.point_id) || `Ponto ${schedule.point_id}`,
            date: dateKey,
            scheduled_time: scheduledTime,
            status,
            measured_at,
            has_push: pushVolunteers.has(schedule.volunteer_id),
          });
        }
      }

      return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    },
  });
};
