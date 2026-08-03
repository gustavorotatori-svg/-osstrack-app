"use client"

import { useState, useEffect, useCallback } from "react"
import { SmartphoneIcon, BellIcon, BellOffIcon } from "@/components/ui/icons"
import { usePushNotifications } from "@/lib/use-push"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function useInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window))
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return true
    }
    return false
  }, [deferredPrompt])

  return { install, canInstall: !!deferredPrompt, isIOS, isStandalone }
}

function registerSw() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }
}

export function InstallPrompt() {
  const { install, canInstall, isIOS, isStandalone } = useInstall()
  const { permission, subscribed, loading, subscribe, unsubscribe } = usePushNotifications()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-install-dismissed") === "true"
    }
    return false
  })

  useEffect(() => {
    registerSw()
  }, [])

  useEffect(() => {
    if (canInstall && !dismissed) setShowPrompt(true)
  }, [canInstall, dismissed])

  function handleDismiss() {
    localStorage.setItem("pwa-install-dismissed", "true")
    setShowPrompt(false)
  }

  if (isStandalone || dismissed) return null

  async function handleInstall() {
    const ok = await install()
    if (ok) setShowPrompt(false)
  }

  async function togglePush() {
    if (subscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const pushAvailable = permission !== "unavailable" && "serviceWorker" in navigator

  return (
    <>
      {showPrompt && canInstall && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
          <div className="glass-card p-4 flex items-start gap-3 shadow-2xl border-[rgba(212,168,71,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--gold)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Instalar OssTrack</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Adicione à tela inicial para acesso rápido</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
                >
                  Instalar
                </button>
                <button
                  onClick={() => { setShowPrompt(false); handleDismiss() }}
                  className="py-2 px-3 rounded-lg text-xs font-semibold border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:text-white transition-all"
                >
                  Agora não
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isIOS && !canInstall && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
          <div className="glass-card p-4 flex items-start gap-3 shadow-2xl border-[rgba(212,168,71,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
              <SmartphoneIcon className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Instalar OssTrack</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                No Safari, toque em <strong>Compartilhar</strong> <span className="text-[var(--gold)]">↑</span> e depois <strong>"Adicionar à Tela de Início"</strong>
              </p>
              <button
                onClick={() => handleDismiss()}
                className="mt-3 py-2 px-4 rounded-lg text-xs font-semibold border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:text-white transition-all"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {!showPrompt && pushAvailable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
          <div className="glass-card p-4 flex items-start gap-3 shadow-2xl border-[rgba(212,168,71,0.12)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
              {subscribed ? <BellIcon className="w-5 h-5 text-[var(--gold)]" /> : <BellOffIcon className="w-5 h-5 text-[var(--text-secondary)]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{subscribed ? "Notificações ativadas" : "Ativar notificações"}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {subscribed ? "Você receberá alertas de streak e lembretes" : "Receba lembretes de treino e alertas"}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={togglePush}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg text-xs font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "..." : subscribed ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => handleDismiss()}
                  className="py-2 px-3 rounded-lg text-xs font-semibold border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:text-white transition-all"
                >
                  {subscribed ? "OK" : "Agora não"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
