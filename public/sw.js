const CACHE_NAME = "osstrack-v2"
const STATIC_ASSETS = [
  "/",
  "/icon-192.svg",
  "/icon-512.svg",
]

const PRIVATE_PREFIXES = ["/api/", "/dashboard/"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  const isPrivate = PRIVATE_PREFIXES.some((p) => url.pathname.startsWith(p))
  if (isPrivate) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

self.addEventListener("push", (event) => {
  let data
  try {
    data = event.data?.json()
  } catch {
    data = null
  }
  const title = data?.title || "OssTrack"
  const body = data?.body || "Novidade no tatame!"
  const url = data?.url || "/dashboard"

  const options = {
    title,
    body,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    vibrate: [200, 100, 200],
    data: { url },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then(() => client.navigate(url))
        }
      }
      return clients.openWindow(url)
    })
  )
})
