"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CrownIcon, SparklesIcon } from "@/components/ui/icons"

const LEVEL_TITLES = ["", "Iniciante", "Guerreiro", "Lutador", "Faixa Azul", "Competidor", "Atleta", "Graduado", "Expert", "Mestre", "Grão-Mestre", "Lenda", "Kami"]

function createConfetti() {
  const particles = []
  const colors = ["#ffd700", "#ff6b35", "#60a5fa", "#a855f7", "#22c55e", "#f97316", "#ec4899"]
  for (let i = 0; i < 40; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
    })
  }
  return particles
}

export function LevelUpCelebration({ currentLevel, pontos }: { currentLevel: number; pontos: number }) {
  const [show, setShow] = useState(false)
  const [levelInfo, setLevelInfo] = useState<{ from: number; to: number; title: string } | null>(null)
  const [confetti, setConfetti] = useState<ReturnType<typeof createConfetti>>([])

  const dismiss = useCallback(() => {
    setShow(false)
    if (levelInfo) {
      try {
        localStorage.setItem("oss_last_level", String(levelInfo.to))
      } catch {}
    }
  }, [levelInfo])

  useEffect(() => {
    try {
      const lastLevel = parseInt(localStorage.getItem("oss_last_level") || "0", 10)
      if (currentLevel > lastLevel && lastLevel > 0) {
        setLevelInfo({ from: lastLevel, to: currentLevel, title: LEVEL_TITLES[currentLevel] || "" })
        setConfetti(createConfetti())
        setShow(true)
      }
      localStorage.setItem("oss_last_level", String(currentLevel))
    } catch {}
  }, [currentLevel])

  return (
    <AnimatePresence>
      {show && levelInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={dismiss}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-sm"
                style={{
                  left: `${p.x}%`,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  rotate: p.rotation,
                }}
                initial={{ y: "-10vh", rotate: 0 }}
                animate={{ y: "110vh", rotate: 720 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-10 glass-card p-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--gold)]/30"
            >
              <CrownIcon className="w-8 h-8 text-black" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 mb-3">
                <SparklesIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Level Up!</span>
                <SparklesIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
              </div>

              <h2 className="text-2xl font-black mb-1">{levelInfo.title}</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Você subiu do nível {levelInfo.from} para o nível {levelInfo.to}!
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{pontos.toLocaleString()} XP totais</p>

              <button
                onClick={dismiss}
                className="mt-6 px-8 py-3 rounded-xl text-sm font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}