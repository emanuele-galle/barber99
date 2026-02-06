const CACHE_NAME = 'barber99-v4'
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
]

// Install event - cache only truly static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // API requests - always network, never cache
  if (request.url.includes('/api/')) return

  // Navigation requests (HTML pages) - ALWAYS network
  // Never cache SSR pages to avoid stale content
  if (request.mode === 'navigate') return

  // Admin panel & Next.js bundles - always network
  if (request.url.includes('/admin') || request.url.includes('/_next/')) return

  // Images - cache first, then network
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (!response.ok) return response
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        }).catch(() => new Response('', { status: 503 }))
      })
    )
    return
  }

  // Fonts and other static assets - stale-while-revalidate
  if (request.destination === 'font' || request.url.includes('/sounds/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => cached)

        return cached || networkFetch
      })
    )
    return
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'Apri',
      },
      {
        action: 'close',
        title: 'Chiudi',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
