// خدمة العمل دون اتصال — أيام تبويض رويدا
// Network-first for the app shell (so deployments reach users immediately),
// stale-while-revalidate for hashed JS/CSS assets (immutable, safe to cache).
const CACHE = 'rweida-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// عند الضغط على الإشعار: افتح التطبيق واعرض الرسالة كاملة (حتى لو كان النص مخفيًا).
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const title = data.title || e.notification.title || '';
  const body = data.realBody || e.notification.body || '';
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if ('focus' in c) { await c.focus(); c.postMessage({ type: 'rweida-notif', title: title, body: body }); return; }
    }
    if (self.clients.openWindow) await self.clients.openWindow('./?n=' + encodeURIComponent(body) + '&nt=' + encodeURIComponent(title));
  })());
});

// عرض الإشعار القادم من الخادم — يُخفى النص ولا يظهر إلا عند فتح التطبيق (خصوصية).
self.addEventListener('push', (e) => {
  let d = { title: 'أيام تبويض رويدا', body: '' };
  try { if (e.data) d = Object.assign(d, e.data.json()); } catch (x) {}
  const realBody = d.body || '';
  // النص ظاهر دائمًا، إلا إذا طُلب إخفاؤه صراحةً (hide=true).
  const shown = (d.hide === true) ? (d.teaser || 'اضغطي لقراءة الرسالة 🤍') : realBody;
  e.waitUntil(self.registration.showNotification(d.title, {
    body: shown, icon: './icon-192.png', badge: './icon-192.png',
    dir: 'rtl', lang: 'ar', data: { realBody: realBody, title: d.title }
  }));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // App shell / navigations: network-first so a new deploy is picked up at once.
  const isNav = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Other assets (hashed, immutable): serve cached, refresh in background.
  e.respondWith(
    caches.match(req).then((cached) => {
      const live = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || live;
    })
  );
});
