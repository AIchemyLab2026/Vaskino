// КСК Васькино — Service Worker v1.2
const CACHE = 'vaskino-v2';
const OFFLINE_ASSETS = [
  '/Vaskino/',
  '/Vaskino/index.html',
  '/Vaskino/manifest.json',
  '/Vaskino/crest.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(OFFLINE_ASSETS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if(resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'КСК Васькино', body: 'Новое уведомление' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'КСК Васькино', {
      body: data.body || '',
      icon: '/Vaskino/crest.png',
      badge: '/Vaskino/crest.png',
      tag: 'vaskino-booking',
      data: { url: data.url || '/Vaskino/#booking' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/Vaskino/'));
});
