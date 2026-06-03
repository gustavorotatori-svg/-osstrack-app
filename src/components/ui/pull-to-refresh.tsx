"use client"

import { useState, useRef, ReactNode } from "react"
import { useRouter } from "next/navigation"

export function PullToRefresh({ children, className = "" }: { children: ReactNode; className?: string }) {
  const router = useRouter()
  const startY = useRef(0)
  const [pulling, setPulling] = useState(false)
  const [pullDist, setPullDist] = useState(0)

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setPulling(true)
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling) return
    const dist = Math.max(0, e.touches[0].clientY - startY.current)
    setPullDist(Math.min(dist, 120))
  }

  function onTouchEnd() {
    if (pullDist > 60) {
      setPullDist(80)
      setTimeout(() => { router.refresh(); setPullDist(0); setPulling(false) }, 300)
    } else {
      setPullDist(0)
      setPulling(false)
    }
  }

  return (
    <div
      className={className}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-x" }}
    >
      {pullDist > 0 && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: Math.min(pullDist, 80) }}
        >
          <span className={`text-sm font-semibold text-[var(--gold)] ${pullDist > 60 ? "" : "animate-spin"}`}>
            {pullDist > 60 ? "↻ Solte para atualizar" : "↓"}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}
