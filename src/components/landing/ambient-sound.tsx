"use client"

import { useState, useEffect, useRef } from "react"
import { playAmbience } from "@/lib/sound"

export function AmbientSoundToggle() {
  const [on, setOn] = useState(false)
  const ref = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    return () => ref.current?.stop()
  }, [])

  function toggle() {
    if (on) {
      ref.current?.stop()
      ref.current = null
      setOn(false)
    } else {
      const a = playAmbience(0.03)
      ref.current = a
      setOn(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-[var(--dark-border)] bg-[var(--dark-card)]/80 backdrop-blur-sm flex items-center justify-center text-sm hover:border-[var(--gold)] transition-all active:scale-90"
      title={on ? "Desligar som ambiente" : "Som ambiente de tatame"}
    >
      {on ? "🔊" : "🔇"}
    </button>
  )
}
