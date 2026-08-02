import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';

  // GET => devolve a chave pública para o app do voluntário
  if (req.method === 'GET') {
    return json({ vapid_public_key: vapidPublicKey });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Corpo inválido' }, 400);
    }

    const { session_token, code, password, subscription, unsubscribe } = payload as Record<string, any>;

    // --- Autenticação do voluntário ---
    let volunteerId: number | null = null;

    if (typeof session_token === 'string' && session_token.length > 10) {
      const { data } = await supabase
        .from('volunteer_sessions')
        .select('volunteer_id, expires_at')
        .eq('token', session_token)
        .maybeSingle();
      if (data && new Date(data.expires_at) > new Date()) {
        volunteerId = data.volunteer_id as number;
      }
    } else if (typeof code === 'string' && typeof password === 'string') {
      const { data } = await supabase.rpc('volunteer_verify_login', {
        p_code: code,
        p_password: password,
      });
      if (Array.isArray(data) && data.length > 0) {
        volunteerId = data[0].volunteer_id as number;
      }
    }

    if (!volunteerId) {
      return json({ error: 'Voluntário não autenticado' }, 401);
    }

    // --- Remoção de inscrição ---
    if (unsubscribe && typeof subscription?.endpoint === 'string') {
      await supabase
        .from('volunteer_push_subscriptions')
        .delete()
        .eq('volunteer_id', volunteerId)
        .eq('endpoint', subscription.endpoint);
      return json({ success: true, removed: true });
    }

    // --- Validação da inscrição ---
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh ?? subscription?.p256dh;
    const auth = subscription?.keys?.auth ?? subscription?.auth;

    if (
      typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 1000 ||
      typeof p256dh !== 'string' || p256dh.length < 20 || p256dh.length > 300 ||
      typeof auth !== 'string' || auth.length < 10 || auth.length > 300
    ) {
      return json({ error: 'Dados de inscrição inválidos' }, 400);
    }

    const { error } = await supabase
      .from('volunteer_push_subscriptions')
      .upsert(
        {
          volunteer_id: volunteerId,
          endpoint,
          p256dh,
          auth,
          user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' },
      );

    if (error) {
      console.error('Erro ao salvar inscrição de push:', error);
      return json({ error: 'Não foi possível salvar a inscrição' }, 500);
    }

    return json({ success: true, vapid_public_key: vapidPublicKey });
  } catch (error) {
    console.error('volunteer-push-subscribe error:', error);
    return json({ error: 'Erro interno' }, 500);
  }
});
