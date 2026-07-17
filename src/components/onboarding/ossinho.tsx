"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"
import { X } from "lucide-react"

function OssinhoIcon({ size = 48 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* shadow */}
      <ellipse cx="24" cy="45" rx="10" ry="2.5" fill="rgba(0,0,0,0.15)" />
      {/* feet */}
      <ellipse cx="17" cy="41" rx="5" ry="3.5" fill="#6B21A8" />
      <ellipse cx="31" cy="41" rx="5" ry="3.5" fill="#6B21A8" />
      {/* bottom ball */}
      <circle cx="24" cy="35" r="10" fill="#9333EA" />
      {/* gi bottom skirt */}
      <path d="M15 31c0 3 3 6 9 6s9-3 9-6" stroke="white" strokeWidth="2.5" fill="white" opacity="0.9" />
      {/* middle ball (body) */}
      <circle cx="24" cy="22" r="9" fill="#9333EA" />
      {/* gi top - V-neck opening */}
      <path d="M16 20c0-2 2-6 8-6s8 4 8 6" stroke="white" strokeWidth="2.5" fill="white" opacity="0.9" />
      <path d="M24 16L20 22" stroke="#9333EA" strokeWidth="1.2" />
      <path d="M24 16L28 22" stroke="#9333EA" strokeWidth="1.2" />
      {/* belt */}
      <rect x="15" y="23.5" width="18" height="3" rx="1.5" fill="#C9A84C" />
      {/* collar/lapels */}
      <path d="M20 20L18 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 20L30 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* arms */}
      <path d="M15 24L9 20" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M33 24L39 20" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
      {/* gi sleeves on arms */}
      <path d="M15 24L11 21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M33 24L37 21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      {/* head */}
      <circle cx="24" cy="12" r="7" fill="#9333EA" />
      {/* headband */}
      <path d="M17.5 10.5a7 7 0 0 1 13 0" stroke="white" strokeWidth="2" fill="none" opacity="0.7" />
      {/* eyes */}
      <circle cx="21.5" cy="11.5" r="1.2" fill="white" />
      <circle cx="26.5" cy="11.5" r="1.2" fill="white" />
      {/* smile */}
      <path d="M21 14.5c1.5 1.5 4.5 1.5 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

type OssinhoTip = {
  id: string
  title: string
  desc: string
}

const pageTipMap: Record<string, Record<string, string>> = {
  aluno: {
    "/dashboard/aluno": "welcome",
    "/dashboard/aluno/checkin": "checkin",
    "/dashboard/aluno/evolucao": "evolucao",
    "/dashboard/aluno/conquistas": "conquistas",
    "/dashboard/aluno/mural": "mural",
    "/dashboard/aluno/ranking": "ranking",
  },
  professor: {
    "/dashboard/professor": "welcome",
    "/dashboard/professor/presencas": "presencas",
    "/dashboard/professor/alunos": "alunos",
    "/dashboard/professor/turmas": "turmas",
  },
  dono: {
    "/dashboard/dono": "welcome",
    "/dashboard/dono/alunos": "alunosDono",
    "/dashboard/dono/graduacoes": "graduacoes",
    "/dashboard/dono/relatorios": "relatorios",
    "/dashboard/dono/financeiro": "financeiro",
    "/dashboard/dono/config": "config",
  },
}

function getTipId(role: string, pathname: string): string | null {
  const map = pageTipMap[role]
  if (!map) return null
  const exact = map[pathname]
  if (exact) return `${role}_${exact}`
  for (const [prefix, id] of Object.entries(map)) {
    if (pathname.startsWith(prefix + "/") || pathname === prefix) {
      return `${role}_${id}`
    }
  }
  return null
}

export function Ossinho({ role, pathname }: { role: string; pathname: string }) {
  const tBase = useT("ossinho")
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [tip, setTip] = useState<OssinhoTip | null>(null)
  const [tipIndex, setTipIndex] = useState(0)

  const t = useCallback(
    (key: string) => {
      try {
        const val = tBase(`tips.${role}.${key}`)
        return val || null
      } catch {
        return null
      }
    },
    [tBase, role],
  )

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ossinho_dismissed")
      if (saved) setDismissed(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  useEffect(() => {
    const tipKey = getTipId(role, pathname)
    if (!tipKey) {
      setVisible(false)
      setTip(null)
      return
    }

    if (dismissed.has(tipKey)) {
      setVisible(false)
      setTip(null)
      return
    }

    const parts = tipKey.split("_")
    const tipId = parts.slice(1).join("_")
    const title = t(`${tipId}.title`)
    const desc = t(`${tipId}.desc`)

    if (title && desc) {
      setTip({ id: tipKey, title, desc })
      setTipIndex(0)
      setVisible(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, pathname, dismissed])

  function dismiss() {
    if (!tip) return
    const next = new Set(dismissed)
    next.add(tip.id)
    setDismissed(next)
    try {
      localStorage.setItem("ossinho_dismissed", JSON.stringify([...next]))
    } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && tip && (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3 max-w-[320px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative"
          >
            <div className="relative bg-[var(--dark-card)] border border-[var(--gold)]/20 rounded-2xl p-4 shadow-2xl shadow-black/40">
              <button
                onClick={dismiss}
                className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-full bg-[var(--dark-border)] border border-[var(--gold)]/20 flex items-center justify-center hover:bg-[var(--gold)]/20 transition-colors"
              >
                <X className="w-4 h-4 text-[var(--white-muted)]" />
              </button>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                  <OssinhoIcon size={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-1">{tip.title}</h4>
                  <p className="text-xs text-[var(--white-muted)] leading-relaxed">{tip.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--dark-border)]">
                <button onClick={dismiss} className="text-xs px-3 py-2 text-[var(--white-muted)] hover:text-white transition-colors min-h-[44px]">
                  {tBase("skip")}
                </button>
                <button
                  onClick={dismiss}
                  className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--gold)] text-black hover:brightness-110 transition-all min-h-[44px]"
                >
                  {tBase("gotIt")}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--dark-card)] border-r border-b border-[var(--gold)]/20 rotate-45" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
            style={{
              animation: "float 3s ease-in-out infinite",
            }}
            onClick={dismiss}
          >
            <OssinhoIcon size={48} />
          </motion.div>
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
}
