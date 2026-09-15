"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UsersIcon, GraduationIcon, CheckIcon, MapPinIcon, DumbbellIcon, XIcon } from "@/components/ui/icons"

type StepKey = "turma" | "professor" | "aluno" | "presenca"

type StepDef = {
  key: StepKey
  title: string
  desc: string
  href: string
  cta: string
  icon: React.ReactNode
}

const STEPS: StepDef[] = [
  {
    key: "turma",
    title: "Crie sua primeira turma",
    desc: "Ex.: \"Adultos\", \"Kids\", \"Iniciantes\". É o primeiro passo para organizar seu Jiu-Jitsu.",
    href: "/dashboard/dono/turmas",
    cta: "Criar turma",
    icon: <DumbbellIcon className="w-5 h-5" />,
  },
  {
    key: "professor",
    title: "Adicione um professor",
    desc: "Vincule um professor para ajudar a gerenciar alunos e turmas.",
    href: "/dashboard/dono/professores",
    cta: "Adicionar professor",
    icon: <GraduationIcon className="w-5 h-5" />,
  },
  {
    key: "aluno",
    title: "Adicione seu primeiro aluno",
    desc: "Cadastre um aluno para começar a registrar presenças e evolução.",
    href: "/dashboard/dono/alunos",
    cta: "Adicionar aluno",
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    key: "presenca",
    title: "Teste o check-in",
    desc: "Confirme uma presença para ver o sistema funcionando de verdade.",
    href: "/dashboard/dono",
    cta: "Ver presenças",
    icon: <MapPinIcon className="w-5 h-5" />,
  },
]

function isMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768
}

export function OnboardingSetup({ role }: { role: string }) {
  const pathname = usePathname()
  const [progress, setProgress] = useState<Record<StepKey, boolean>>({
    turma: false,
    professor: false,
    aluno: false,
    presenca: false,
  })
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => !isMobile())

  useEffect(() => {
    try {
      if (localStorage.getItem("osstrack_setup_done") === "1") setDismissed(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (role !== "dono") return
    let active = true
    async function load() {
      try {
        const res = await fetch("/api/onboarding/setup")
        const data = await res.json()
        if (active && data.steps) {
          setProgress(data.steps)
          if (Object.values(data.steps).every(Boolean)) {
            try { localStorage.setItem("osstrack_setup_done", "1") } catch {}
          }
        }
      } catch {}
      if (active) setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [role, pathname])

  const doneCount = Object.values(progress).filter(Boolean).length
  const total = STEPS.length
  const percent = Math.round((doneCount / total) * 100)
  const complete = doneCount === total

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try { localStorage.setItem("osstrack_setup_done", "1") } catch {}
  }, [])

  if (role !== "dono" || dismissed) return null

  if (!loading && complete) {
    return (
      <div className="mb-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-5 flex items-start gap-4 md:items-center justify-between">
        <div className="flex items-start gap-4 md:items-center">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-400">
            <CheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Sua academia está no ar! 🎉</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Checklist de boas-vindas concluído. Explore o painel para acompanhar turmas, alunos e financeiro.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Fechar"
          className="hidden md:inline-flex p-2 text-[var(--text-muted)] hover:text-white transition-colors shrink-0"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-[var(--gold)]/20 bg-gradient-to-b from-[var(--bg-surface)]/80 to-[var(--bg)] overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-lg font-extrabold text-white">Bem-vindo(a) ao OssTrack! 👋</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Configure sua academia em poucos passos para começar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>{percent}%</span>
            <button
              onClick={() => (collapsed ? setCollapsed(false) : setCollapsed(true))}
              aria-label={collapsed ? "Expandir" : "Recolher"}
              className="p-2 text-[var(--text-muted)] hover:text-white transition-colors shrink-0"
            >
              {collapsed ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 h-2 rounded-full bg-[var(--border)]/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {!collapsed && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {STEPS.map((step) => {
              const done = progress[step.key]
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  onClick={done ? undefined : undefined}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    done
                      ? "border-emerald-500/30 bg-emerald-500/[0.06] cursor-default"
                      : "border-[var(--border)] hover:border-[var(--gold)]/40 hover:bg-[var(--bg-surface)] cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      done ? "bg-emerald-500/15 text-emerald-400" : "bg-[var(--border)]/40 text-[var(--gold)]"
                    }`}
                  >
                    {done ? <CheckIcon className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text)]">{step.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{step.desc}</p>
                    {!done && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold mt-2" style={{ color: "var(--gold)" }}>
                        {step.cta}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}