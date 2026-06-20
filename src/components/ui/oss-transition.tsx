"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

function playOssAudio() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sawtooth"
    osc1.frequency.setValueAtTime(280, now)
    osc1.frequency.exponentialRampToValueAtTime(420, now + 0.6)
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.8)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(560, now)
    osc2.frequency.exponentialRampToValueAtTime(840, now + 0.6)
    gain2.gain.setValueAtTime(0.08, now)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now)
    osc2.stop(now + 0.7)
    setTimeout(() => ctx.close(), 1000)
  } catch {}
}

let resolveQueue: (() => void) | null = null

export function triggerOssTransition(): Promise<void> {
  playOssAudio()
  return new Promise((resolve) => {
    resolveQueue = resolve as () => void
    window.dispatchEvent(new CustomEvent("oss:start"))
  })
}

export function finishOssTransition() {
  window.dispatchEvent(new CustomEvent("oss:end"))
}

export function OssTransition() {
  const [show, setShow] = useState(false)
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    const onStart = () => {
      clearTimers()
      setShow(true)
      setPhase("enter")
      timerRef.current = setTimeout(() => setPhase("hold"), 500)
      timerRef.current = setTimeout(() => {
        setPhase("exit")
        if (resolveQueue) {
          resolveQueue()
          resolveQueue = null
        }
      }, 1400)
      timerRef.current = setTimeout(() => setShow(false), 2200)
    }
    const onEnd = () => {
      clearTimers()
      setPhase("exit")
      if (resolveQueue) {
        resolveQueue()
        resolveQueue = null
      }
      setTimeout(() => setShow(false), 400)
    }
    window.addEventListener("oss:start", onStart)
    window.addEventListener("oss:end", onEnd)
    return () => {
      window.removeEventListener("oss:start", onStart)
      window.removeEventListener("oss:end", onEnd)
      clearTimers()
    }
  }, [clearTimers])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ pointerEvents: phase === "exit" ? "none" : "auto" }}
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            transition={{ duration: phase === "exit" ? 0.5 : 0.25 }}
          />
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
              animate={
                phase === "enter" ? { y: 0, opacity: 1, filter: "blur(0px)" } :
                phase === "hold" ? { y: 0, opacity: 1, filter: "blur(0px)" } :
                { y: -20, opacity: 0, filter: "blur(4px)" }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_40px_rgba(212,168,71,0.25)]"
                style={{ color: "var(--gold)" }}>
                Oss<span className="text-white">Track</span>
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
