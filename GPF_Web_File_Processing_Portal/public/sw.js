// Service worker for the GPF portal.
//
// The portal is an ONLINE-ONLY website. This worker exists for one reason only:
// to make the site installable, so the browser can put a "gpf-app" icon on the
// home screen that is nothing more than a shortcut to the site URL.
//
// It deliberately caches NOTHING. Every request goes to the network, so with no
// internet the page fails to load exactly like any other website, and the app
// itself shows the "ইন্টারনেট সংযোগ নেই" warning. It also deletes any cache left
// behind by the previous offline-capable version.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// No `fetch` listener: the browser talks to the network directly, so nothing is
// ever served from a stale cache and offline always means offline.
