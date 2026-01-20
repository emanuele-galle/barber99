const CACHE_NAME = 'barber-sergi-v2'
const STATIC_ASSETS = [
  '/',
  '/prenota',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests (always network)
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Skip admin panel and Next.js bundles (prevent hydration issues)
  if (request.url.includes('/admin') || request.url.includes('/_next/')) {
    event.respondWith(fetch(request))
    return
  }

  // For images - cache first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse

        return fetch(request).then((response) => {
          if (!response.ok) return response

          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
      })
    )
    return
  }

  // For pages - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response.ok) throw new Error('Network response not ok')

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/')
          }

          return new Response('Offline', { status: 503 })
        })
      })
  )
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
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
