// КСК Васькино — Service Worker v1.0
const CACHE = 'vaskino-v1';
const OFFLINE_ASSETS = ['/', '/index.html', '/manifest.json', '/crest.png'];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', e => {
  // Only cache GET requests for same origin
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Clone and cache successful responses
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications (stub — wire up with web-push server)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'КСК Васькино', body: 'Новое уведомление' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'КСК Васькино', {
      body: data.body || '',
      icon: '/crest.png',
      badge: '/crest.png',
      tag: 'vaskino-booking',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/#booking' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});
