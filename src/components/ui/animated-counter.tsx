"use client"

import { useEffect, useState, useRef } from "react"

export function AnimatedCounter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current || started.current) return
    started.current = true
    const duration = 800
    const start = performance.now()
    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return <span ref={ref} className={className}>{display}{suffix}</span>
}
