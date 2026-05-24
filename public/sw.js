self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "OssTrack", body: "Novidade no tatame!" }

  const options = {
    title: data.title,
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/dashboard/aluno" },
  }

  event.waitUntil(self.registration.showNotification(options.title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard/aluno"
  event.waitUntil(clients.openWindow(url))
})
