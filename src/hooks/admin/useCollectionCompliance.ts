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
  collected_time?: string;
  has_push: boolean;
}

const TZ = 'America/Bahia';
const BUCKET = 'coleta-voluntarios';

/** Converte um instante para { date: 'YYYY-MM-DD', minutes } no fuso de Brasília */
const toZoned = (input: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(input);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(hour) * 60 + Number(get('minute')),
    time: `${hour}:${get('minute')}`,
  };
};

const toLocalDateKey = (date: Date) => toZoned(date).date;

const timeToMinutes = (value: string) => {
  const [h, m] = value.split(':');
  return Number(h) * 60 + Number(m);
};

/** Extrai o instante (UTC) do nome do arquivo de coleta */
const parseUploadDate = (name: string): Date | null => {
  // Formato atual: 20260803_144142_coleta.xlsx
  const current = name.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (current) {
    const [, y, mo, d, h, mi, s] = current;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
  }
  // Formato antigo: ...-2025-12-13T15-21-06-822Z.xlsx
  const legacy = name.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/);
  if (legacy) {
    const [, y, mo, d, h, mi, s] = legacy;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
  }
  return null;
};

/** Lista os meses (YYYY-MM, fuso Brasília) presentes na janela consultada */
const monthsInWindow = (days: number) => {
  const months = new Set<string>();
  for (let offset = 0; offset < days; offset++) {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    months.add(toLocalDateKey(day).slice(0, 7));
  }
  return Array.from(months);
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
        .gte('measured_at', start.toISOString());

      if (readingsError) throw readingsError;

      // Índices de comprovação de coleta
      const byVolunteer = new Map<string, string[]>(); // volunteer:date
      const byPoint = new Map<string, string[]>(); // point:date

      const pushEvidence = (map: Map<string, string[]>, key: string, iso: string) => {
        map.set(key, [...(map.get(key) || []), iso]);
      };

      (readings || []).forEach((r: any) => {
        const dateKey = toLocalDateKey(new Date(r.measured_at));
        if (r.volunteer_id != null) {
          pushEvidence(byVolunteer, `${r.volunteer_id}:${dateKey}`, r.measured_at);
        }
        if (r.point_id != null) {
          pushEvidence(byPoint, `${r.point_id}:${dateKey}`, r.measured_at);
        }
      });

      // Uploads de planilhas no storage (fonte principal das coletas dos voluntários)
      const months = monthsInWindow(days);
      const scheduledVolunteerIds = new Set(schedules.map((s: any) => s.volunteer_id));
      const codes = Array.from(scheduledVolunteerIds)
        .map((id) => volunteers.get(id))
        .filter(Boolean) as any[];

      await Promise.all(
        codes.flatMap((volunteer) =>
          months.map(async (month) => {
            const { data: files, error } = await supabase.storage
              .from(BUCKET)
              .list(`${volunteer.code}/${month}`, { limit: 200 });

            if (error || !files) return;

            files.forEach((file) => {
              const uploadedAt = parseUploadDate(file.name) ?? (file.created_at ? new Date(file.created_at) : null);
              if (!uploadedAt || Number.isNaN(uploadedAt.getTime())) return;
              const dateKey = toLocalDateKey(uploadedAt);
              pushEvidence(byVolunteer, `${volunteer.id}:${dateKey}`, uploadedAt.toISOString());
            });
          }),
        ),
      );

      const items: ComplianceItem[] = [];
      const now = new Date();
      const nowZoned = toZoned(now);

      for (let offset = 0; offset < days; offset++) {
        const day = new Date();
        day.setDate(day.getDate() - offset);
        day.setHours(12, 0, 0, 0);
        const dateKey = toLocalDateKey(day);
        const weekday = new Date(`${dateKey}T12:00:00`).getDay();

        for (const schedule of schedules) {
          const weekdays: number[] = (schedule.weekdays as any) || [];
          if (!weekdays.includes(weekday)) continue;

          const volunteer = volunteers.get(schedule.volunteer_id);
          if (!volunteer || volunteer.is_active === false) continue;

          const scheduledTime = String(schedule.scheduled_time).slice(0, 5);
          const tolerance = schedule.tolerance_minutes ?? 60;
          const target = timeToMinutes(scheduledTime);

          // ignora ocorrências de hoje ainda dentro da tolerância
          if (dateKey === nowZoned.date && nowZoned.minutes < target + tolerance) continue;

          const evidence = [
            ...(byVolunteer.get(`${schedule.volunteer_id}:${dateKey}`) || []),
            ...(byPoint.get(`${schedule.point_id}:${dateKey}`) || []),
          ];

          let status: ComplianceStatus = 'missed';
          let measured_at: string | undefined;
          let collected_time: string | undefined;

          if (evidence.length > 0) {
            const zoned = evidence
              .map((iso) => ({ iso, ...toZoned(new Date(iso)) }))
              .sort((a, b) => a.minutes - b.minutes);

            const inWindow = zoned.find((e) => Math.abs(e.minutes - target) <= tolerance);
            const chosen = inWindow ?? zoned[0];
            measured_at = chosen.iso;
            collected_time = chosen.time;
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
            collected_time,
            has_push: pushVolunteers.has(schedule.volunteer_id),
          });
        }
      }

      return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    },
  });
};
