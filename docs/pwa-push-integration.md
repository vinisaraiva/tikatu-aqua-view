# Integração de push no app Tikatu Coleta (PWA)

Cole este código no app do voluntário (outro projeto). Chave pública VAPID:

```
BBh1BEaWHr4zS5OZNcBCiLRSEwUI15LoHTRy3CMd8bowyJBhiFUJK5WiQablVaj-6IpKupVDb9fNYYsrGb03EF8
```

## 1. Service worker (`public/firebase-free-push-sw.js` ou dentro do SW existente)

```js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Tikatu', {
      body: data.body || '',
      tag: data.tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/'));
});
```

## 2. Registro do dispositivo (após o login do voluntário)

```ts
const VAPID_PUBLIC_KEY =
  'BBh1BEaWHr4zS5OZNcBCiLRSEwUI15LoHTRy3CMd8bowyJBhiFUJK5WiQablVaj-6IpKupVDb9fNYYsrGb03EF8';

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export async function enablePushNotifications(sessionToken: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  await fetch(
    'https://okduzgpkahddkdpzibua.supabase.co/functions/v1/volunteer-push-subscribe',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: sessionToken, // ou { code, password }
        subscription: subscription.toJSON(),
      }),
    },
  );
}
```

Também funciona autenticando com `{ code, password }` do voluntário em vez do `session_token`.

## 3. Agendamento automático (pendente)

Para os lembretes saírem sozinhos, agende a função `volunteer-collection-reminders`
para rodar a cada 15 minutos (cron no banco ou qualquer agendador externo).
Enquanto isso, o admin pode enviar manualmente pelo card "Coletas pendentes".
