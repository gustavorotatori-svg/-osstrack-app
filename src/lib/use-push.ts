"use client"

import { useEffect, useState, useCallback } from "react"
import { getVapidPublicKey } from "@/lib/vapid-public"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return new Uint8Array(rawData.length).map((_, i) => rawData.charCodeAt(i))
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "unavailable">("default")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unavailable")
      return
    }
    setPermission(Notification.permission)
    checkSubscription()
  }, [])

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    } catch {
      setSubscribed(false)
    }
  }

  const subscribe = useCallback(async () => {
    if (permission === "unavailable" || permission === "denied") return false
    setLoading(true)
    try {
      let notifPermission = permission as NotificationPermission
      if (notifPermission !== "granted") {
        const result = await Notification.requestPermission()
        setPermission(result)
        notifPermission = result
      }

      if (notifPermission !== "granted") return false

      const reg = await navigator.serviceWorker.ready
      const existingSub = await reg.pushManager.getSubscription()
      if (existingSub) {
        await existingSub.unsubscribe()
      }

      const publicKey = getVapidPublicKey()
      if (!publicKey) {
        console.warn("[usePush] VAPID public key not available")
        return false
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const subJSON = sub.toJSON()
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      })

      setSubscribed(true)
      return true
    } catch (error) {
      console.error("[usePush] subscription error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [permission])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.toJSON().endpoint
        await sub.unsubscribe()
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        })
      }
      setSubscribed(false)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { permission, subscribed, loading, subscribe, unsubscribe }
}
