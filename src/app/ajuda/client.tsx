"use client"

import { useState } from "react"

type FaqItem = { q: string; r: string }

export function AjudaClient({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} className="glass-card overflow-hidden transition-all duration-300">
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-4 md:p-5 text-left active:scale-[0.97] transition-transform"
            >
              <span className="text-sm font-semibold pr-4">{item.q}</span>
              <span className={`shrink-0 text-[var(--gold)] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 md:px-5 pb-4 md:pb-5">
                <p className="text-sm text-[var(--white-muted)] leading-relaxed">{item.r}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
