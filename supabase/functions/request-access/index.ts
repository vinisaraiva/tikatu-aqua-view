// Edge function: receives an access request (name + email) from the public
// site access screen and stores it as a pending request.
// SECURITY:
// - Public (no auth). Input validated with Zod.
// - In-memory rate limiting per IP (best-effort; resets on cold start).
// - Never logs the request body content.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const attempts = new Map<string, { count: number; firstAt: number }>();

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

const BodySchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(120),
  email: z.string().trim().email('Email inválido').max(255),
  message: z.string().trim().max(1000).optional(),
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(200, { success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return jsonResponse(200, {
      success: false,
      error: 'RATE_LIMITED',
      message: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.',
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(200, { success: false, error: 'INVALID_INPUT', message: 'Dados inválidos.' });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(200, {
      success: false,
      error: 'INVALID_INPUT',
      message: parsed.error.errors[0]?.message || 'Dados inválidos.',
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Configuração ausente: credenciais do Supabase');
    return jsonResponse(500, { success: false, error: 'SERVER_MISCONFIGURED' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase.from('access_requests').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message ?? null,
    status: 'pending',
  });

  if (error) {
    console.error('Erro ao inserir solicitação de acesso:', error.message);
    return jsonResponse(500, { success: false, error: 'SERVER_ERROR' });
  }

  return jsonResponse(200, { success: true });
});
