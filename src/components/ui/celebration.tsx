"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CONFETTI = ["🥋", "✨", "🔥", "🎉", "⭐", "💪", "👊", "🏆"]

type CelebrationProps = { show: boolean; title?: string; message?: string; submessage?: string; onDone?: () => void }

export function Celebration({ show, title, message, submessage, onDone }: CelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([])

  useEffect(() => {
    if (!show) {
      setParticles([])
      return
    }
    const p = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
    }))
    setParticles(p)
    const timer = setTimeout(() => onDone?.(), 2500)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="glass-card-gold p-8 text-center mx-4 max-w-xs"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-lg font-extrabold text-white mb-1">{title || message || ""}</h3>
            {submessage && <p className="text-xs text-[var(--white-muted)]">{submessage}</p>}
            {!submessage && <p className="text-xs text-[var(--white-muted)]">Continue evoluindo!</p>}
          </motion.div>

          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: "100vh", x: `${p.x}vw`, opacity: 1, rotate: 0 }}
              animate={{ y: "-20vh", opacity: 0, rotate: 720 }}
              transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
              className="fixed text-2xl pointer-events-none"
              style={{ left: `${p.x}vw`, top: 0 }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Celebration as CelebrationOverlay }
