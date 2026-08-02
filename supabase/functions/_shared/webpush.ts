// Minimal Web Push (RFC 8291 / RFC 8292) implementation for Deno.
// Encrypts payloads with aes128gcm and signs VAPID JWTs with ES256.

const b64urlToBytes = (input: string): Uint8Array => {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
};

const bytesToB64url = (bytes: Uint8Array): string => {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const concat = (...arrays: Uint8Array[]): Uint8Array => {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
};

const encoder = new TextEncoder();

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, data));
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hmac(salt, ikm);
  const okm = await hmac(prk, concat(info, new Uint8Array([1])));
  return okm.slice(0, length);
}

async function importVapidPrivateKey(privateD: string, publicKey: string): Promise<CryptoKey> {
  const pub = b64urlToBytes(publicKey);
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d: privateD,
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    ext: true,
  };
  return await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

async function buildVapidHeader(audience: string, subject: string, publicKey: string, privateKey: string) {
  const header = bytesToB64url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = bytesToB64url(
    encoder.encode(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: subject,
      }),
    ),
  );
  const unsigned = `${header}.${payload}`;
  const key = await importVapidPrivateKey(privateKey, publicKey);
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, encoder.encode(unsigned)),
  );
  return `vapid t=${unsigned}.${bytesToB64url(signature)}, k=${publicKey}`;
}

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface SendPushResult {
  ok: boolean;
  status: number;
  body?: string;
}

export async function sendWebPush(
  subscription: PushSubscriptionInput,
  payload: unknown,
  vapid: { publicKey: string; privateKey: string; subject: string },
): Promise<SendPushResult> {
  const clientPublic = b64urlToBytes(subscription.p256dh);
  const clientAuth = b64urlToBytes(subscription.auth);

  // Ephemeral ECDH key pair
  const localKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPublic = new Uint8Array(await crypto.subtle.exportKey('raw', localKeys.publicKey));
  const importedClientPublic = await crypto.subtle.importKey(
    'raw',
    clientPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: importedClientPublic }, localKeys.privateKey, 256),
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const authInfo = concat(
    encoder.encode('WebPush: info\0'),
    clientPublic,
    localPublic,
  );
  const ikm = await hkdf(clientAuth, sharedSecret, authInfo, 32);
  const contentEncryptionKey = await hkdf(salt, ikm, encoder.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, encoder.encode('Content-Encoding: nonce\0'), 12);

  const plaintext = concat(encoder.encode(JSON.stringify(payload)), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey('raw', contentEncryptionKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, plaintext),
  );

  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096);
  const body = concat(salt, recordSize, new Uint8Array([localPublic.length]), localPublic, ciphertext);

  const url = new URL(subscription.endpoint);
  const authorization = await buildVapidHeader(
    `${url.protocol}//${url.host}`,
    vapid.subject,
    vapid.publicKey,
    vapid.privateKey,
  );

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '3600',
      Urgency: 'high',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, status: response.status, body: text };
  }
  return { ok: true, status: response.status };
}
