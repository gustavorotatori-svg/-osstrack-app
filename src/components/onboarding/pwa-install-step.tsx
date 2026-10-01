"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { usePushNotifications } from "@/lib/use-push"
import { useT } from "@/lib/use-t"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type DeviceType = "android-chrome" | "ios-safari" | "desktop-chrome" | "desktop-edge" | "desktop-other" | "other"

function detectDevice(): DeviceType {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)
  const isAndroid = /Android/.test(ua)
  const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua)
  const isEdge = /Edge|Edg/.test(ua)

  if (isAndroid && isChrome) return "android-chrome"
  if (isAndroid && isEdge) return "android-chrome"
  if (isIOS) return "ios-safari"
  if (!isAndroid && !isIOS && isChrome) return "desktop-chrome"
  if (!isAndroid && !isIOS && isEdge) return "desktop-edge"
  if (!isAndroid && !isIOS) return "desktop-other"
  return "other"
}

function buildSteps(t: (k: string) => string): Record<DeviceType, { icon: string; title: string; instructions: string[] }> {
  return {
    "android-chrome": {
      icon: "📱",
      title: t("android.titulo"),
      instructions: [t("android.i1"), t("android.i2"), t("android.i3"), t("android.i4")],
    },
    "ios-safari": {
      icon: "🍎",
      title: t("ios.titulo"),
      instructions: [t("ios.i1"), t("ios.i2"), t("ios.i3"), t("ios.i4")],
    },
    "desktop-chrome": {
      icon: "💻",
      title: t("chrome.titulo"),
      instructions: [t("chrome.i1"), t("chrome.i2"), t("chrome.i3"), t("chrome.i4")],
    },
    "desktop-edge": {
      icon: "💻",
      title: t("edge.titulo"),
      instructions: [t("edge.i1"), t("edge.i2"), t("edge.i3"), t("edge.i4")],
    },
    "desktop-other": {
      icon: "💻",
      title: t("outro.titulo"),
      instructions: [t("outro.i1"), t("outro.i2"), t("outro.i3"), t("outro.i4")],
    },
    "other": {
      icon: "📲",
      title: t("generic.titulo"),
      instructions: [t("generic.i1"), t("generic.i2"), t("generic.i3"), t("generic.i4")],
    },
  }
}

export function PwaInstallStep({ onComplete }: { onComplete: () => void }) {
  const t = useT("pwa.step")
  const STEPS = buildSteps(t)
  const [step, setStep] = useState<"pwa" | "push">("pwa")
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const device = detectDevice()
  const pwaStep = STEPS[device]
  const push = usePushNotifications()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setInstalled(true))
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") setInstalled(true)
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  const canAutoInstall = !!deferredPrompt

  const handleNext = useCallback(() => {
    if (step === "pwa") {
      setStep("push")
    } else {
      onComplete()
    }
  }, [step, onComplete])

  const handleSkip = useCallback(() => {
    onComplete()
  }, [onComplete])

  const handleSubscribe = useCallback(async () => {
    await push.subscribe()
    onComplete()
  }, [push, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div
        key={step}
        className="relative z-10 w-full max-w-sm surface p-6 md:p-8 text-center space-y-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        {step === "pwa" ? (
          <>
            <div className="text-5xl mb-2">{pwaStep.icon}</div>

            <div>
              <h2 className="text-xl font-extrabold">{pwaStep.title}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("subtitle")}
              </p>
            </div>

            <div className="space-y-0 text-left">
              {pwaStep.instructions.map((text, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[var(--border)]/50 last:border-0">
                  <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>{i + 1}</span>
                  </div>
                  <p className="text-sm text-[var(--text)]">{text}</p>
                </div>
              ))}
            </div>

            {installed && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-emerald-400 font-semibold">{t("instalado")}</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {canAutoInstall && !installed && (
                <button
                  onClick={handleInstall}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
                  style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}
                >
                  {t("instalarAgora")}
                </button>
              )}

              <button
                onClick={handleNext}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                  !installed && canAutoInstall
                    ? "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                    : "btn"
                }`}
                style={installed || !canAutoInstall ? { background: "var(--gold)", color: "#000", fontWeight: 700 } : {}}
              >
                {installed ? t("continuar") : canAutoInstall ? t("pular") : t("jaAdicionei")}
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              {t("rodape")}
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-2">🔔</div>

            <div>
              <h2 className="text-xl font-extrabold">{t("pushTitle")}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {t("pushDesc")}
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>1</span>
                </div>
                <p className="text-sm text-[var(--text)]">{t("push1")}</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>2</span>
                </div>
                <p className="text-sm text-[var(--text)]">{t("push2")}</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>3</span>
                </div>
                <p className="text-sm text-[var(--text)]">{t("push3")}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={push.loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}
              >
                {push.loading ? t("ativando") : t("ativarNotif")}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              >
                {t("agoraNao")}
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              {t("pushRodape")}
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
