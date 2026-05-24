"use client"

import { useEffect, useState } from "react"
import { playCelebrationSound } from "@/lib/sound"

const emojis = ["🥋", "🔥", "💪", "⭐", "🎉", "⚡", "🌟", "🏆", "🎊", "💯", "👊", "🔱"]

type Particle = { id: number; emoji: string; x: number; delay: number; size: number; duration: number }

export function CelebrationOverlay({
  show, message, submessage, onDone,
}: {
  show: boolean; message: string; submessage?: string; onDone?: () => void
}) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!show) { setParticles([]); return }
    playCelebrationSound()
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100, delay: Math.random() * 0.8,
        size: 14 + Math.random() * 22, duration: 2 + Math.random() * 2,
      }))
    )
    const timer = setTimeout(() => { setParticles([]); onDone?.() }, 5000)
    return () => clearTimeout(timer)
  }, [show])

  if (!show && particles.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />

      {/* Partículas */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`, top: `-10%`, fontSize: `${p.size}px`,
            animation: `confettiFall ${p.duration}s linear forwards`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Texto central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-hero-fade-up" style={{ animationDuration: "0.6s" }}>
          <div className="text-7xl mb-4 animate-float-up" style={{ "--dur": "2s" } as any}>🥋</div>
          <h2 className="text-4xl md:text-5xl font-black gradient-gold-text leading-tight">{message}</h2>
          {submessage && (
            <p className="text-lg text-[var(--white-muted)] mt-3 font-medium">{submessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
