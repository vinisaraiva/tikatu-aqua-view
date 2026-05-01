// Edge function: validates the shared site password and returns a signed HMAC session token.
// SECURITY:
// - The expected password hash is stored as a secret (SITE_ACCESS_HASH = sha256 hex of password).
// - Tokens are HMAC-SHA256 signed with SITE_ACCESS_TOKEN_SECRET.
// - Constant-time comparison is used to prevent timing attacks.
// - In-memory rate limiting per IP (best-effort; resets on cold start).
// - Standardized response contract: expected errors return HTTP 200 with
//   { success: false, error: CODE, message }. HTTP 5xx is reserved for real
//   server failures. Never logs the request body, password, or hash.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signToken(payload: object, secret: string): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadJson));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = base64UrlEncode(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

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
    return jsonResponse(200, {
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Método não permitido',
    });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return jsonResponse(200, {
      success: false,
      error: 'RATE_LIMITED',
      message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    });
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(200, {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Senha inválida.',
    });
  }

  const password = body.password;
  if (typeof password !== 'string' || password.length < 1 || password.length > 200) {
    return jsonResponse(200, {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Senha inválida.',
    });
  }

  const expectedHash = (Deno.env.get('SITE_ACCESS_HASH') || '').trim().toLowerCase();
  const tokenSecret = Deno.env.get('SITE_ACCESS_TOKEN_SECRET') || '';

  if (!expectedHash || !tokenSecret) {
    // Real server failure — keep 5xx; do not log secrets or request body.
    console.error('Configuração ausente: SITE_ACCESS_HASH ou SITE_ACCESS_TOKEN_SECRET');
    return jsonResponse(500, {
      success: false,
      error: 'SERVER_MISCONFIGURED',
      message: 'Servidor mal configurado. Tente novamente mais tarde.',
    });
  }

  const providedHash = await sha256Hex(password);

  if (!timingSafeEqual(providedHash, expectedHash)) {
    return jsonResponse(200, {
      success: false,
      error: 'INVALID_PASSWORD',
      message: 'Senha incorreta. Tente novamente.',
    });
  }

  // Success: issue token
  const exp = Date.now() + SESSION_DURATION_MS;
  const token = await signToken({ exp }, tokenSecret);

  // Reset attempts on success
  attempts.delete(ip);

  return jsonResponse(200, {
    success: true,
    token,
    expiresAt: exp,
  });
});
