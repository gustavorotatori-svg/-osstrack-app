"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePushNotifications } from "@/lib/use-push"

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

const STEPS: Record<DeviceType, { icon: string; title: string; instructions: string[] }> = {
  "android-chrome": {
    icon: "📱",
    title: "Adicionar à Tela Inicial",
    instructions: [
      "Toque no menu ⋮ (três pontinhos) no canto superior direito",
      "Role até encontrar a opção 'Adicionar à tela inicial'",
      "Toque em 'Adicionar' para confirmar",
      "Pronto! O ícone do OssTrack aparecerá na sua tela inicial",
    ],
  },
  "ios-safari": {
    icon: "🍎",
    title: "Adicionar à Tela de Início",
    instructions: [
      "Toque no ícone de Compartilhar ↑ na barra inferior do Safari",
      "Role a lista e toque em 'Adicionar à Tela de Início'",
      "Edite o nome (opcional) e toque em 'Adicionar' no canto superior direito",
      "Pronto! O ícone do OssTrack aparecerá na sua tela inicial",
    ],
  },
  "desktop-chrome": {
    icon: "💻",
    title: "Instalar no Computador",
    instructions: [
      "Clique no ícone de instalar 🖥️ na barra de endereço (canto direito)",
      "Ou clique no menu ⋮ → 'Instalar OssTrack'",
      "Clique em 'Instalar' na janela que aparecer",
      "Pronto! O OssTrack abrirá como uma janela separada",
    ],
  },
  "desktop-edge": {
    icon: "💻",
    title: "Instalar no Computador",
    instructions: [
      "Clique no ícone de instalar na barra de endereço",
      "Ou clique no menu ⋯ → 'Aplicativos' → 'Instalar este site como um aplicativo'",
      "Clique em 'Instalar' na janela que aparecer",
      "Pronto! O OssTrack abrirá como uma janela separada",
    ],
  },
  "desktop-other": {
    icon: "💻",
    title: "Adicionar aos Favoritos",
    instructions: [
      "Pressione Ctrl+D (Windows/Linux) ou Cmd+D (Mac) para favoritar",
      "Para melhor experiência, use Chrome ou Edge para instalar como aplicativo",
      "No Chrome: clique no ícone 🖥️ na barra de endereço",
      "No Edge: clique em ⋯ → 'Aplicativos' → 'Instalar este site'",
    ],
  },
  "other": {
    icon: "📲",
    title: "Adicionar à Tela Inicial",
    instructions: [
      "Abra o menu do navegador (⋮ ou ⋯)",
      "Procure por 'Adicionar à tela inicial' ou 'Instalar aplicativo'",
      "Confirme a instalação",
      "Pronto! O ícone do OssTrack estará na sua tela inicial",
    ],
  },
}

export function PwaInstallStep({ onComplete }: { onComplete: () => void }) {
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
                Adicione o OssTrack à sua área de trabalho para acessar rápido como um app nativo
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
                <p className="text-sm text-emerald-400 font-semibold">✓ Instalado com sucesso!</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {canAutoInstall && !installed && (
                <button
                  onClick={handleInstall}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
                  style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}
                >
                  Instalar Agora
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
                {installed ? "Continuar →" : canAutoInstall ? "Pular por enquanto" : "Já adicionei! Continuar →"}
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Depois de instalar, você pode acessar o OssTrack de qualquer lugar com um toque
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-2">🔔</div>

            <div>
              <h2 className="text-xl font-extrabold">Não perca nenhum treino</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Ative as notificações para receber lembretes de check-in, novas missões e convites
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>1</span>
                </div>
                <p className="text-sm text-[var(--text)]">Lembrete diário de check-in</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>2</span>
                </div>
                <p className="text-sm text-[var(--text)]">Missões diárias e conquistas</p>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>3</span>
                </div>
                <p className="text-sm text-[var(--text)]">Convites de academia e turma</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={push.loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50"
                style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}
              >
                {push.loading ? "Ativando..." : "Ativar Notificações"}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              >
                Agora não
              </button>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Você pode ativar ou desativar as notificações a qualquer momento nas configurações
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
