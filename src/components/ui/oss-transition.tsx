"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

let resolveQueue: (() => void) | null = null

export function triggerOssTransition(): Promise<void> {
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    const onStart = () => {
      clearTimers()
      setShow(true)
      timerRef.current = setTimeout(() => {
        if (resolveQueue) {
          resolveQueue()
          resolveQueue = null
        }
        setShow(false)
      }, 350)
    }
    const onEnd = () => {
      clearTimers()
      if (resolveQueue) {
        resolveQueue()
        resolveQueue = null
      }
      setShow(false)
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-3xl font-extrabold tracking-tight"
              style={{ color: "var(--gold)" }}>
              Oss<span className="text-white">Track</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
