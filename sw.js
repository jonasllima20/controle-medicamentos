// ═══════════════════════════════════════════════════════════
// SERVICE WORKER — Remédios das Crianças
// Versão: 1.0
// ═══════════════════════════════════════════════════════════
const CACHE_NAME = 'remedios-v1';

// ── Instalação ────────────────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// ── Push recebido ─────────────────────────────────────────
self.addEventListener('push', e => {
  let data = { title: '💊 Remédios das Crianças', body: '', icon: '/favicon.ico', badge: '/favicon.ico', tag: 'evento', data: {} };
  try {
    if (e.data) Object.assign(data, e.data.json());
  } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon  || '/favicon.ico',
      badge:   data.badge || '/favicon.ico',
      tag:     data.tag   || 'evento',
      data:    data.data  || {},
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'ver',    title: '👀 Ver evento' },
        { action: 'ok',     title: '✅ Ok, ciente' },
      ]
    })
  );
});

// ── Clique na notificação ─────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'ok') return;

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url && c.focus);
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});

// ── Notificações agendadas localmente (via postMessage) ───
// O app envia mensagem para o SW agendar via setTimeout
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    const { delayMs, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon:    '/favicon.ico',
        badge:   '/favicon.ico',
        tag:     tag || 'evento-agendado',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'ver', title: '👀 Ver evento' },
          { action: 'ok',  title: '✅ Ok, ciente'  },
        ]
      });
    }, delayMs);
  }
});
