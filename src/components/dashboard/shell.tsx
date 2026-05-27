"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { ReactNode, ReactElement, useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { OnboardingTour } from "@/components/onboarding/tour"
import { useTheme } from "@/components/layout/providers"

type IconProps = { active: boolean }

function HomeIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CheckinIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ChartIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function AwardIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
}

function UsersIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CalendarIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function SettingsIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function StopwatchIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="7" y1="2" x2="9" y2="3" />
      <line x1="17" y1="2" x2="15" y2="3" />
    </svg>
  )
}

function CheckIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function BellIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function ShareIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function ReportIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function UserIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const navItems: Record<string, { href: string; tkey: string; icon: (p: IconProps) => ReactElement }[]> = {
  aluno: [
    { href: "/dashboard/aluno", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/aluno/checkin", tkey: "checkin", icon: CheckinIcon },
    { href: "/dashboard/aluno/treino", tkey: "treino", icon: StopwatchIcon },
    { href: "/dashboard/aluno/evolucao", tkey: "evolucao", icon: ChartIcon },
    { href: "/dashboard/aluno/mural", tkey: "mural", icon: BellIcon },
    { href: "/dashboard/aluno/ranking", tkey: "ranking", icon: AwardIcon },
    { href: "/dashboard/aluno/agenda", tkey: "agenda", icon: CalendarIcon },
    { href: "/dashboard/aluno/financeiro", tkey: "financeiro", icon: CheckIcon },
  ],
  professor: [
    { href: "/dashboard/professor", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/professor/presencas", tkey: "presencas", icon: CheckIcon },
    { href: "/dashboard/professor/alunos", tkey: "alunos", icon: UsersIcon },
    { href: "/dashboard/professor/agenda", tkey: "agenda", icon: CalendarIcon },
    { href: "/dashboard/professor/graduacoes", tkey: "graduacoes", icon: AwardIcon },
  ],
  dono: [
    { href: "/dashboard/dono", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/dono/alunos", tkey: "alunos", icon: UsersIcon },
    { href: "/dashboard/dono/agenda", tkey: "agenda", icon: CalendarIcon },
    { href: "/dashboard/dono/financeiro", tkey: "financeiro", icon: CheckIcon },
    { href: "/dashboard/dono/relatorios", tkey: "relatorios", icon: ReportIcon },
    { href: "/dashboard/dono/graduacoes", tkey: "graduacoes", icon: AwardIcon },
    { href: "/dashboard/dono/config", tkey: "config", icon: SettingsIcon },
  ],
}

const topNavItems: Record<string, { href: string; tkey: string; icon: (p: IconProps) => ReactElement }[]> = {
  aluno: [
    { href: "/dashboard/aluno/notificacoes", tkey: "notificacoes", icon: BellIcon },
    { href: "/dashboard/aluno/conquistas", tkey: "conquistas", icon: AwardIcon },
    { href: "/dashboard/aluno/premium", tkey: "premium", icon: AwardIcon },
    { href: "/dashboard/aluno/perfil", tkey: "perfil", icon: UserIcon },
  ],
  professor: [
    { href: "/dashboard/professor/perfil", tkey: "perfil", icon: UserIcon },
  ],
  dono: [
    { href: "/dashboard/dono/perfil", tkey: "perfil", icon: UserIcon },
  ],
}

export function DashboardShell({ children, role }: { children: ReactNode; role: string }) {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const t = useT("dashboard")
  const items = navItems[role as keyof typeof navItems] || []
  const topItems = topNavItems[role as keyof typeof topNavItems] || []
  const [showTour, setShowTour] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(`osstrack_tour_${role}`)
    if (!seen) setShowTour(true)
  }, [role])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data) => setNotifCount(data.filter((n: { lida: boolean }) => !n.lida).length))
      .catch(() => {})
  }, [pathname])

  function completeTour() {
    localStorage.setItem(`osstrack_tour_${role}`, "true")
    setShowTour(false)
  }

  return (
    <div className="min-h-screen bg-[var(--black-soft)] flex flex-col">
      {showTour && <OnboardingTour role={role} onComplete={completeTour} />}

      <header
        className={`flex items-center justify-between px-4 py-3 sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-strong" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center text-xs text-black font-bold shrink-0">
            🥋
          </div>
          <span className="font-bold text-sm">OssTrack</span>
          <span className="badge-gold text-[10px]">
            {t(role)}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`relative p-2 rounded-xl transition-all ${
                  isActive ? "text-[var(--gold)] bg-[rgba(201,168,76,0.08)]" : "text-[var(--gray)] hover:text-[var(--white-muted)]"
                }`}
              >
                <Icon active={isActive} />
                {t(item.tkey) === "Notificações" && notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-gold rounded-full text-[8px] text-black font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
            )
          })}
          <button onClick={toggleTheme} className="btn-ghost text-xs" title="Alternar tema">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-64 lg:w-72 bg-[var(--black)]/90 backdrop-blur-2xl border-r border-[var(--dark-border)] flex-col py-4">
        <div className="flex items-center gap-3 px-5 mb-8 mt-2">
          <div className="w-9 h-9 gradient-gold rounded-xl flex items-center justify-center text-sm text-black font-bold shrink-0">
            🥋
          </div>
          <div>
            <span className="font-bold text-sm">OssTrack</span>
            <span className="badge-gold text-[9px] block mt-0.5 w-fit">
              {t(role)}
            </span>
          </div>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive ? "bg-[rgba(201,168,76,0.1)] text-[var(--gold)] border border-[rgba(201,168,76,0.15)]" : "text-[var(--white-muted)] hover:text-white hover:bg-[var(--dark-card)]"
                }`}
              >
                <Icon active={isActive} />
                <span>{t(item.tkey)}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] ml-auto" />}
              </button>
            )
          })}
        </div>
        <div className="px-3 mt-auto space-y-1">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all text-sm font-medium relative ${
                  isActive ? "bg-[rgba(201,168,76,0.08)] text-[var(--gold)]" : "text-[var(--gray)] hover:text-[var(--white-muted)] hover:bg-[var(--dark-card)]"
                }`}
              >
                <Icon active={isActive} />
                <span>{t(item.tkey)}</span>
                {t(item.tkey) === "Notificações" && notifCount > 0 && (
                  <span className="ml-auto w-5 h-5 gradient-gold rounded-full text-[9px] text-black font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
            )
          })}
          <div className="border-t border-[var(--dark-border)] pt-2 mt-2">
            <button onClick={toggleTheme} className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-[var(--gray)] hover:text-[var(--white-muted)] hover:bg-[var(--dark-card)] transition-all">
              {theme === "dark" ? "☀️" : "🌙"} <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-[var(--gray)] hover:text-red-400 hover:bg-[var(--dark-card)] transition-all">
              🚪 <span>{t("sair")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full px-4 py-4 pb-28 md:pb-4 md:ml-64 lg:ml-72 transition-all" id="page-content">
        <div className="max-w-lg mx-auto md:max-w-3xl lg:max-w-5xl">
          <div className="animate-fade-in">{children}</div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--black)]/95 backdrop-blur-2xl border-t border-[var(--dark-border)] flex items-center justify-around py-1.5 pb-[max(4px,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive ? "text-[var(--gold)]" : "text-[var(--gray)] hover:text-[var(--white-muted)]"
              }`}
            >
              <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                <Icon active={isActive} />
              </div>
              <span className={`text-[9px] font-medium tracking-tight ${isActive ? "text-[var(--gold)]" : ""}`}>
                {t(item.tkey)}
              </span>
              {isActive && <div className="w-4 h-0.5 bg-[var(--gold)] rounded-full mt-0.5" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
