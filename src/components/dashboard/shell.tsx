"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { ReactNode, useState, useEffect } from "react"
import { OnboardingTour } from "@/components/onboarding/tour"

const navItems = {
  aluno: [
    { href: "/dashboard/aluno", label: "Início", icon: "▦" },
    { href: "/dashboard/aluno/checkin", label: "Check-in", icon: "📍" },
    { href: "/dashboard/aluno/evolucao", label: "Evolução", icon: "📈" },
    { href: "/dashboard/aluno/mural", label: "Mural", icon: "📢" },
    { href: "/dashboard/aluno/ranking", label: "Ranking", icon: "🏆" },
  ],
  professor: [
    { href: "/dashboard/professor", label: "Início", icon: "▦" },
    { href: "/dashboard/professor/presencas", label: "Presenças", icon: "✓" },
    { href: "/dashboard/professor/alunos", label: "Alunos", icon: "👥" },
    { href: "/dashboard/professor/turmas", label: "Turmas", icon: "📅" },
  ],
  dono: [
    { href: "/dashboard/dono", label: "Dashboard", icon: "▦" },
    { href: "/dashboard/dono/alunos", label: "Alunos", icon: "👥" },
    { href: "/dashboard/dono/relatorios", label: "Relatórios", icon: "📊" },
    { href: "/dashboard/dono/graduacoes", label: "Graduações", icon: "🥋" },
    { href: "/dashboard/dono/config", label: "Config", icon: "⚙" },
  ],
}

export function DashboardShell({
  children,
  role,
}: {
  children: ReactNode
  role: string
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const items = navItems[role as keyof typeof navItems] || []
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(`osstrack_tour_${role}`)
    if (!seen) {
      setShowTour(true)
    }
  }, [role])

  function completeTour() {
    localStorage.setItem(`osstrack_tour_${role}`, "true")
    setShowTour(false)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {showTour && <OnboardingTour role={role} onComplete={completeTour} />}
      <header className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-[var(--dark-border)] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">🥋</span>
          <span className="font-bold text-base">OssTrack</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] font-semibold">
            {role === "dono" ? "Dono" : role === "professor" ? "Professor" : "Aluno"}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-[var(--white-muted)] hover:text-white transition-colors px-3 py-1.5"
        >
          Sair
        </button>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24" id="page-content">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] border-t border-[var(--dark-border)] flex items-center justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] transition-colors ${
              pathname === item.href ? "text-[var(--gold)]" : "text-[var(--gray)] hover:text-[var(--white-muted)]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
