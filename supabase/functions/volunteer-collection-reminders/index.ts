import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendWebPush } from '../_shared/webpush.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const TIME_ZONE = 'America/Sao_Paulo';

/** Retorna data/hora local (SP) como { date: 'YYYY-MM-DD', minutes, weekday } */
function localNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    weekday: weekdayMap[get('weekday')] ?? 0,
  };
}

const timeToMinutes = (value: string) => {
  const [h, m] = value.split(':');
  return Number(h) * 60 + Number(m);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const vapid = {
    publicKey: Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
    privateKey: Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
    subject: Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@tikatu.com.br',
  };

  if (!vapid.publicKey || !vapid.privateKey) {
    return json({ error: 'Chaves VAPID não configuradas' }, 500);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const payload = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const manualScheduleId: string | undefined = payload?.schedule_id;

    // Envio manual exige admin autenticado
    if (manualScheduleId) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Não autorizado' }, 401);
      }
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError || !userData?.user) {
        return json({ error: 'Não autorizado' }, 401);
      }
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: userData.user.id,
        _role: 'admin',
      });
      if (!isAdmin) {
        return json({ error: 'Apenas administradores' }, 403);
      }
    }

    const { date, minutes, weekday } = localNow();

    let query = supabase
      .from('volunteer_schedules')
      .select('id, volunteer_id, point_id, weekdays, scheduled_time, tolerance_minutes, is_active')
      .eq('is_active', true);

    if (manualScheduleId) {
      query = query.eq('id', manualScheduleId);
    }

    const { data: schedules, error: schedulesError } = await query;
    if (schedulesError) throw schedulesError;

    const due = (schedules ?? []).filter((s: any) => {
      if (manualScheduleId) return true;
      if (!Array.isArray(s.weekdays) || !s.weekdays.includes(weekday)) return false;
      const target = timeToMinutes(String(s.scheduled_time));
      const tolerance = s.tolerance_minutes ?? 60;
      // janela: 15 min antes do horário até o fim da tolerância
      return minutes >= target - 15 && minutes <= target + tolerance;
    });

    if (due.length === 0) {
      return json({ checked: schedules?.length ?? 0, sent: 0, skipped: 'nenhuma coleta na janela' });
    }

    // Nomes dos pontos
    const pointIds = [...new Set(due.map((s: any) => s.point_id))];
    const { data: points } = await supabase.from('points').select('id, name').in('id', pointIds);
    const pointNames = new Map((points ?? []).map((p: any) => [p.id, p.name]));

    // Leituras de hoje (para não avisar quem já coletou)
    const dayStart = new Date(`${date}T00:00:00-03:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59-03:00`).toISOString();
    const { data: todaysReadings } = await supabase
      .from('readings')
      .select('volunteer_id, point_id')
      .gte('measured_at', dayStart)
      .lte('measured_at', dayEnd);
    const collected = new Set((todaysReadings ?? []).map((r: any) => `${r.volunteer_id}:${r.point_id}`));

    // Lembretes já enviados hoje
    const { data: alreadySent } = await supabase
      .from('volunteer_reminder_log')
      .select('schedule_id')
      .eq('reminder_date', date)
      .eq('kind', 'due');
    const sentSchedules = new Set((alreadySent ?? []).map((r: any) => r.schedule_id));

    let sent = 0;
    const results: unknown[] = [];

    for (const schedule of due) {
      const key = `${schedule.volunteer_id}:${schedule.point_id}`;
      if (!manualScheduleId && (collected.has(key) || sentSchedules.has(schedule.id))) continue;

      const { data: subs } = await supabase
        .from('volunteer_push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('volunteer_id', schedule.volunteer_id);

      if (!subs || subs.length === 0) {
        results.push({ schedule: schedule.id, status: 'sem dispositivo registrado' });
        continue;
      }

      const pointName = pointNames.get(schedule.point_id) ?? 'ponto de coleta';
      const body = {
        title: 'Hora da coleta 💧',
        body: `Lembrete: coleta prevista em ${pointName} às ${String(schedule.scheduled_time).slice(0, 5)}.`,
        tag: `coleta-${schedule.id}-${date}`,
        url: '/',
      };

      let delivered = 0;
      for (const sub of subs) {
        const result = await sendWebPush(sub, body, vapid);
        if (result.ok) {
          delivered++;
          await supabase
            .from('volunteer_push_subscriptions')
            .update({ last_success_at: new Date().toISOString() })
            .eq('id', sub.id);
        } else {
          console.error(`Push falhou [${result.status}] ${result.body}`);
          if (result.status === 404 || result.status === 410) {
            await supabase.from('volunteer_push_subscriptions').delete().eq('id', sub.id);
          }
        }
      }

      if (delivered > 0) {
        sent += delivered;
        await supabase.from('volunteer_reminder_log').upsert(
          {
            schedule_id: schedule.id,
            volunteer_id: schedule.volunteer_id,
            point_id: schedule.point_id,
            reminder_date: date,
            kind: 'due',
            sent_count: delivered,
          },
          { onConflict: 'schedule_id,reminder_date,kind' },
        );
      }

      results.push({ schedule: schedule.id, delivered });
    }

    return json({ checked: due.length, sent, results });
  } catch (error) {
    console.error('volunteer-collection-reminders error:', error);
    return json({ error: String((error as Error).message ?? error) }, 500);
  }
});
