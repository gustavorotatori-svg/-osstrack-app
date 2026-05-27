"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { ReactNode, ReactElement, useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { OnboardingTour } from "@/components/onboarding/tour"
import { useTheme } from "@/components/layout/providers"

type IconProps = { active: boolean }

function HomeIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function CheckinIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
}
function ChartIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}
function AwardIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
}
function UsersIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function CalendarIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function SettingsIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
}
function StopwatchIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="7" y1="2" x2="9" y2="3" /><line x1="17" y1="2" x2="15" y2="3" /></svg>
}
function CheckIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
function BellIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
}
function ReportIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
}
function UserIcon({ active }: IconProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c9a84c" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}

const navItems: Record<string, { href: string; tkey: string; icon: (p: IconProps) => ReactElement }[]> = {
  aluno: [
    { href: "/dashboard/aluno", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/aluno/checkin", tkey: "checkin", icon: CheckinIcon },
    { href: "/dashboard/aluno/treino", tkey: "treino", icon: StopwatchIcon },
    { href: "/dashboard/aluno/agenda", tkey: "agenda", icon: CalendarIcon },
    { href: "/dashboard/aluno/evolucao", tkey: "evolucao", icon: ChartIcon },
    { href: "/dashboard/aluno/ranking", tkey: "ranking", icon: AwardIcon },
    { href: "/dashboard/aluno/mural", tkey: "mural", icon: BellIcon },
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
    { href: "/dashboard/aluno/perfil", tkey: "perfil", icon: UserIcon },
    { href: "/dashboard/aluno/premium", tkey: "premium", icon: AwardIcon },
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
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(`osstrack_tour_${role}`)
    if (!seen) setShowTour(true)
  }, [role])

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

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-60 bg-[var(--black)]/95 backdrop-blur-2xl border-r border-[var(--dark-border)] flex-col">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--dark-border)]">
          <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center text-sm text-black font-bold shrink-0">🥋</div>
          <div>
            <span className="font-bold text-sm">OssTrack</span>
            <span className="badge-gold text-[9px] block mt-0.5 w-fit">{t(role)}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive ? "bg-[rgba(201,168,76,0.1)] text-[var(--gold)]" : "text-[var(--white-muted)] hover:text-white hover:bg-[var(--dark-card)]"}`}>
                <Icon active={isActive} />
                <span>{t(item.tkey)}</span>
              </button>
            )
          })}
        </div>
        <div className="px-3 py-3 border-t border-[var(--dark-border)] space-y-0.5">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive ? "bg-[rgba(201,168,76,0.08)] text-[var(--gold)]" : "text-[var(--gray)] hover:text-[var(--white-muted)] hover:bg-[var(--dark-card)]"}`}>
                <Icon active={isActive} />
                <span>{t(item.tkey)}</span>
              </button>
            )
          })}
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--gray)] hover:text-[var(--white-muted)] hover:bg-[var(--dark-card)] transition-all">
            {theme === "dark" ? "☀️" : "🌙"} <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--gray)] hover:text-red-400 hover:bg-[var(--dark-card)] transition-all">
            🚪 <span>{t("sair")}</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER (minimal) */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-[var(--black)]/90 backdrop-blur-xl border-b border-[var(--dark-border)] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 gradient-gold rounded-lg flex items-center justify-center text-[10px] text-black font-bold">🥋</div>
          <span className="font-bold text-sm">OssTrack</span>
          <span className="badge-gold text-[9px]">{t(role)}</span>
        </div>
        <div className="flex items-center gap-1">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`p-2 rounded-lg transition-all ${isActive ? "text-[var(--gold)] bg-[rgba(201,168,76,0.08)]" : "text-[var(--gray)]"}`}>
                <Icon active={isActive} />
              </button>
            )
          })}
          <button onClick={toggleTheme} className="p-2 rounded-lg text-[var(--gray)] text-sm">{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full md:ml-60">
        <div className="max-w-lg mx-auto md:max-w-3xl lg:max-w-5xl px-4 py-5 pb-28 md:pb-8">
          {children}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--black)]/95 backdrop-blur-2xl border-t border-[var(--dark-border)] flex items-center justify-around px-1 py-1 pb-[max(4px,env(safe-area-inset-bottom))]">
        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${isActive ? "text-[var(--gold)]" : "text-[var(--gray)]"}`}>
              <div className={isActive ? "scale-110 transition-transform" : ""}><Icon active={isActive} /></div>
              <span className={`text-[9px] font-medium ${isActive ? "text-[var(--gold)]" : ""}`}>{t(item.tkey)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
