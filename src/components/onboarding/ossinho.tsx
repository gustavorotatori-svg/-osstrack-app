"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"
import { X } from "lucide-react"

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
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--dark-border)] border border-[var(--gold)]/20 flex items-center justify-center hover:bg-[var(--gold)]/20 transition-colors"
              >
                <X className="w-3 h-3 text-[var(--white-muted)]" />
              </button>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-lg shrink-0 shadow-lg shadow-[var(--gold)]/20">
                  🥋
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-1">{tip.title}</h4>
                  <p className="text-xs text-[var(--white-muted)] leading-relaxed">{tip.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--dark-border)]">
                <button onClick={dismiss} className="text-[11px] text-[var(--white-muted)] hover:text-white transition-colors">
                  {tBase("skip")}
                </button>
                <button
                  onClick={dismiss}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black hover:brightness-110 transition-all"
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
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-2xl shadow-xl shadow-[var(--gold)]/30 cursor-pointer hover:scale-105 transition-transform active:scale-95"
            style={{
              animation: "float 3s ease-in-out infinite",
            }}
            onClick={dismiss}
          >
            🥋
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
