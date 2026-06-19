// Edge function: admin-only. Generates a random site access password for an
// access request, stores its SHA-256 hash in site_access_codes (active, no
// expiry), links it to the request, marks the request approved, and returns
// the plaintext password ONCE so the admin can share it manually.
// SECURITY:
// - Caller must be an authenticated admin (validated via has_role).
// - Plaintext password is returned only in this response, never stored.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BodySchema = z.object({
  requestId: z.string().uuid(),
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generatePassword(length = 14): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(200, { success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('Configuração ausente: credenciais do Supabase');
    return jsonResponse(500, { success: false, error: 'SERVER_MISCONFIGURED' });
  }

  // Validate caller identity from the Authorization header
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return jsonResponse(401, { success: false, error: 'UNAUTHORIZED' });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonResponse(401, { success: false, error: 'UNAUTHORIZED' });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', {
    _user_id: userData.user.id,
    _role: 'admin',
  });
  if (roleErr || !isAdmin) {
    return jsonResponse(403, { success: false, error: 'FORBIDDEN' });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonResponse(200, { success: false, error: 'INVALID_INPUT' });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(200, { success: false, error: 'INVALID_INPUT' });
  }

  // Load the request
  const { data: request, error: reqErr } = await admin
    .from('access_requests')
    .select('id, name, email, status, site_access_code_id')
    .eq('id', parsed.data.requestId)
    .maybeSingle();

  if (reqErr) {
    console.error('Erro ao buscar solicitação:', reqErr.message);
    return jsonResponse(500, { success: false, error: 'SERVER_ERROR' });
  }
  if (!request) {
    return jsonResponse(200, { success: false, error: 'NOT_FOUND', message: 'Solicitação não encontrada.' });
  }
  if (request.status === 'approved' && request.site_access_code_id) {
    return jsonResponse(200, {
      success: false,
      error: 'ALREADY_APPROVED',
      message: 'Esta solicitação já possui uma senha gerada.',
    });
  }

  // Generate password + hash
  const password = generatePassword();
  const passwordHash = await sha256Hex(password);
  const label = `${request.name} <${request.email}>`.slice(0, 200);

  const { data: code, error: codeErr } = await admin
    .from('site_access_codes')
    .insert({
      label,
      password_hash: passwordHash,
      is_active: true,
      expires_at: null,
    })
    .select('id')
    .single();

  if (codeErr || !code) {
    console.error('Erro ao criar código de acesso:', codeErr?.message);
    return jsonResponse(500, { success: false, error: 'SERVER_ERROR' });
  }

  const { error: updErr } = await admin
    .from('access_requests')
    .update({ status: 'approved', site_access_code_id: code.id })
    .eq('id', request.id);

  if (updErr) {
    console.error('Erro ao atualizar solicitação:', updErr.message);
    return jsonResponse(500, { success: false, error: 'SERVER_ERROR' });
  }

  return jsonResponse(200, { success: true, password });
});
