// Molios Empire — offline cache (stale-while-revalidate)
const CACHE = 'me-shell-v1'
const SHELL = ['/', '/favicon.ico', '/apple-touch-icon.png', '/og-image.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return res
          })
          .catch(() => caches.match('/'))
    )
  )
})
