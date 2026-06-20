import webpush from "web-push"
import prisma from "@/lib/prisma"

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contato@osstrack.app"

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export function getVapidPublicKey() {
  return vapidPublicKey
}

export async function sendPushToUser(usuarioId: string, payload: {
  title: string
  body: string
  url?: string
}) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { usuarioId },
    })

    if (!subscriptions.length) return { sent: 0, total: 0 }

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || "/dashboard",
          })
        )
      )
    )

    let sent = 0
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === "fulfilled") {
        sent++
      } else {
        const err = result.reason
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: subscriptions[i].id },
          })
        }
      }
    }

    return { sent, total: subscriptions.length }
  } catch (error) {
    console.error("[webpush] sendPushToUser error:", error)
    return { sent: 0, total: 0 }
  }
}
