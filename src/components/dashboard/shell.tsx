"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ReactNode, ReactElement, useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { OnboardingTour } from "@/components/onboarding/tour"
import { Ossinho } from "@/components/onboarding/ossinho"
import { PwaInstallStep } from "@/components/onboarding/pwa-install-step"
import { useTheme } from "@/components/layout/providers"
import { InstallPrompt, useInstall } from "@/components/pwa/install-prompt"
import { OssTransition, triggerOssTransition } from "@/components/ui/oss-transition"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { DumbbellIcon, SunIcon, MoonIcon, LogOutIcon } from "@/components/ui/icons"

type IconProps = { active: boolean }

const S = { w: "22", h: "22", sw: "1.8" as const, lc: "round" as const, lj: "round" as const }

function HomeIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function CheckinIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
}
function ChartIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}
function DollarIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
}
function AwardIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
}
function UsersIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function CalendarIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function SettingsIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
}
function StopwatchIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="7" y1="2" x2="9" y2="3" /><line x1="17" y1="2" x2="15" y2="3" /></svg>
}
function CheckIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><polyline points="20 6 9 17 4 12" /></svg>
}
function BellIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
}
function ReportIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
}
function UserIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function ShieldIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}
function HelpIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
}
function ListIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
}
function ShareIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
}
function BookIcon({ active }: IconProps) {
  return <svg width={S.w} height={S.h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={S.sw} strokeLinecap={S.lc} strokeLinejoin={S.lj}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
}
function ExternalIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
}

const navItems: Record<string, { href: string; tkey: string; icon: (p: IconProps) => ReactElement }[]> = {
  aluno: [
    { href: "/dashboard/aluno", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/aluno/evolucao", tkey: "evolucao", icon: ChartIcon },
    { href: "/dashboard/aluno/mural", tkey: "mural", icon: BellIcon },
    { href: "/dashboard/aluno/compartilhar", tkey: "compartilhar", icon: ShareIcon },
  ],
  professor: [
    { href: "/dashboard/professor", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/professor/presencas", tkey: "presencas", icon: CheckIcon },
    { href: "/dashboard/professor/alunos", tkey: "alunos", icon: UsersIcon },
    { href: "/dashboard/professor/turmas", tkey: "turmas", icon: ListIcon },
    { href: "/dashboard/professor/graduacoes", tkey: "graduacoes", icon: AwardIcon },
    { href: "/dashboard/professor/mural", tkey: "mural", icon: BellIcon },
    { href: "/dashboard/professor/financeiro", tkey: "financeiro", icon: DollarIcon },
    { href: "/dashboard/professor/agenda", tkey: "agenda", icon: CalendarIcon },
  ],
  dono: [
    { href: "/dashboard/dono", tkey: "inicio", icon: HomeIcon },
    { href: "/dashboard/dono/mural", tkey: "mural", icon: BellIcon },
    { href: "/dashboard/dono/turmas", tkey: "turmas", icon: ListIcon },
    { href: "/dashboard/dono/alunos", tkey: "alunos", icon: UsersIcon },
    { href: "/dashboard/dono/financeiro", tkey: "financeiro", icon: DollarIcon },
    { href: "/dashboard/dono/relatorios", tkey: "relatorios", icon: ReportIcon },
    { href: "/dashboard/dono/agenda", tkey: "agenda", icon: CalendarIcon },
    { href: "/dashboard/dono/graduacoes", tkey: "graduacoes", icon: AwardIcon },
    { href: "/dashboard/dono/professores", tkey: "professores", icon: UsersIcon },
    { href: "/dashboard/dono/config", tkey: "config", icon: SettingsIcon },
  ],
}

const topNavItems: Record<string, { href: string; tkey: string; icon: (p: IconProps) => ReactElement }[]> = {
  aluno: [
    { href: "/dashboard/aluno/notificacoes", tkey: "notificacoes", icon: BellIcon },
    { href: "/dashboard/aluno/perfil", tkey: "perfil", icon: UserIcon },
  ],
  professor: [
    { href: "/dashboard/professor/notificacoes", tkey: "notificacoes", icon: BellIcon },
    { href: "/dashboard/professor/perfil", tkey: "perfil", icon: UserIcon },
  ],
  dono: [
    { href: "/dashboard/dono/notificacoes", tkey: "notificacoes", icon: BellIcon },
    { href: "/dashboard/dono/perfil", tkey: "perfil", icon: UserIcon },
  ],
}

const utilityLinks = [
  { href: "https://ibjjf.com/rules", tkey: "regrasIbjjf", icon: BookIcon, external: true },
  { href: "/lgpd", tkey: "lgpd", icon: ShieldIcon, external: false },
  { href: "/ajuda", tkey: "ajuda", icon: HelpIcon, external: false },
]

export function DashboardShell({ children, role }: { children: ReactNode; role: string }) {
  const { data: session } = useSession()
  const { theme, themePref, cycleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const t = useT("dashboard")
  const items = navItems[role as keyof typeof navItems] || []
  const topItems = topNavItems[role as keyof typeof topNavItems] || []
  const [showTour, setShowTour] = useState(false)
  const [showPwaStep, setShowPwaStep] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [tourLoaded, setTourLoaded] = useState(false)
  const { install, canInstall, isIOS, isStandalone } = useInstall()
  const canInstallApp = (canInstall || isIOS) && !isStandalone

  // Check server-side tour state first, fall back to localStorage
  useEffect(() => {
    async function checkTour() {
      try {
        const res = await fetch("/api/tour")
        const data = await res.json()
        if (!data.visto) {
          const localSeen = localStorage.getItem(`osstrack_tour_${role}`)
          if (!localSeen) {
            // Check PWA install step first
            const pwaDone = localStorage.getItem("osstrack_pwa_installed")
            if (!pwaDone) {
              setShowPwaStep(true)
            } else {
              setShowTour(true)
            }
          }
        }
      } catch {
        const localSeen = localStorage.getItem(`osstrack_tour_${role}`)
        if (!localSeen) {
          const pwaDone = localStorage.getItem("osstrack_pwa_installed")
          if (!pwaDone) {
            setShowPwaStep(true)
          } else {
            setShowTour(true)
          }
        }
      }
      setTourLoaded(true)
    }
    checkTour()
  }, [role])

  function handlePwaComplete() {
    localStorage.setItem("osstrack_pwa_installed", "true")
    setShowPwaStep(false)
    // Proceed to tour
    const localSeen = localStorage.getItem(`osstrack_tour_${role}`)
    if (!localSeen) setShowTour(true)
  }

  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data) => setNotifCount(data.filter((n: { lida: boolean }) => !n.lida).length))
      .catch((e) => console.error("notificações", e))
  }, [pathname])

  async function completeTour() {
    try {
      await fetch("/api/tour", { method: "PATCH" })
    } catch {}
    localStorage.setItem(`osstrack_tour_${role}`, "true")
    setShowTour(false)
  }

  function restartTour() {
    localStorage.removeItem(`osstrack_tour_${role}`)
    setShowTour(true)
  }

  async function navigate(href: string) {
    await triggerOssTransition()
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-[var(--black-soft)] flex flex-col relative">

      {showPwaStep && <PwaInstallStep onComplete={handlePwaComplete} />}
      {showTour && <OnboardingTour role={role} onComplete={completeTour} />}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-60 bg-[var(--bg)] border-r border-[var(--border)] flex-col">
        <Link href="/" className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)] hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gold)" }}>
            <DumbbellIcon className="w-4.5 h-4.5 text-black" />
          </div>
          <div>
            <span className="font-extrabold text-base" style={{ background: "var(--gold-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>OssTrack</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gold)" }}>{t(role)}</span>
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-none">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
                <button key={item.href} onClick={() => navigate(item.href)}
                className={`sidebar-nav-item w-full ${isActive ? "active" : ""}`}>
                <Icon active={isActive} />
                <span className={`text-sm ${isActive ? "font-extrabold" : "font-semibold"}`}>{t(item.tkey)}</span>
              </button>
            )
          })}
        </div>

        {/* Sidebar footer: perfil + extras */}
        <div className="px-3 py-2 border-t border-[var(--border)] space-y-0.5">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isNotif = item.tkey === "notificacoes"
            return (
              <button key={item.href} onClick={() => router.push(item.href)} aria-label={t(item.tkey)}
                className={`sidebar-nav-item w-full ${isActive ? "active" : ""}`}>
                <div className="relative">
                  <Icon active={isActive} />
                  {isNotif && notifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow-lg">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{t(item.tkey)}</span>
              </button>
            )
          })}

          <div className="h-px bg-[var(--border)] my-1.5" />

          {utilityLinks.map((link) => {
            const Icon = link.icon
            return link.external ? (
              <a key={t(link.tkey)} href={link.href} target="_blank" rel="noopener noreferrer"
                className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">
                <Icon active={false} />
                <span>{t(link.tkey)}</span>
                <ExternalIcon />
              </a>
            ) : (
              <button key={t(link.tkey)} onClick={() => navigate(link.href)} aria-label={t(link.tkey)}
                className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">
                <Icon active={false} />
                <span>{t(link.tkey)}</span>
              </button>
            )
          })}

          <div className="h-px bg-[var(--border)] my-1.5" />

          {canInstallApp && (
            <button onClick={install}
              className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--gold)] hover:text-[var(--gold)]/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Instalar App</span>
            </button>
          )}
          <button onClick={() => restartTour()}
            className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
            <span>Ver Tour</span>
          </button>
          <button onClick={cycleTheme}
            className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text)]">
            {themePref === "auto" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            <span>{themePref === "auto" ? "Automático" : t(theme === "dark" ? "modoClaro" : "modoEscuro")}</span>
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="min-h-[44px] w-full flex items-center gap-3 px-4 py-3 text-xs text-[var(--text-muted)] hover:text-[var(--red)]">
            <LogOutIcon className="w-4 h-4" /> <span>{t("sair")}</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 bg-[var(--bg)]/95 sticky top-0 z-50 border-b border-[var(--border)]/50 pt-[env(safe-area-inset-top)]" style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}>
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--gold)", color: "#000" }}>
            <DumbbellIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm" style={{ background: "var(--gold-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>OssTrack</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--gold)" }}>{t(role)}</span>
          </div>
        </Link>
        <div className="flex items-center gap-0.5">
          {topItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isNotif = item.tkey === "notificacoes"
            return (
              <button key={item.href} onClick={() => navigate(item.href)} aria-label={t(item.tkey)}
                className={`p-2.5 rounded-xl transition-all relative ${isActive ? "text-[var(--red)] bg-[var(--red-dim)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)]"}`}>
                <Icon active={isActive} />
                {isNotif && notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow-lg">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>
            )
          })}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label={showMobileMenu ? "Fechar menu" : "Menu"} className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] text-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showMobileMenu ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY MENU */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-3 top-16 w-56 surface py-2 overflow-hidden" onClick={e => e.stopPropagation()}>
            {utilityLinks.map((link) => {
              const Icon = link.icon
              return link.external ? (
                <a key={t(link.tkey)} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors">
                  <Icon active={false} /><span>{t(link.tkey)}</span><ExternalIcon />
                </a>
              ) : (
                <button key={t(link.tkey)} onClick={async () => { await triggerOssTransition(); router.push(link.href); setShowMobileMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors">
                  <Icon active={false} /><span>{t(link.tkey)}</span>
                </button>
              )
            })}
            {canInstallApp && (
              <button onClick={() => { install(); setShowMobileMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--gold)] hover:text-[var(--gold)]/80 hover:bg-[var(--bg-input)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Instalar App</span>
              </button>
            )}
            <button onClick={() => { restartTour(); setShowMobileMenu(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              <span>Ver Tour</span>
            </button>
            <div className="h-px bg-[var(--border)] my-1" />
            <button onClick={cycleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors">
              {themePref === "auto" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              <span>{themePref === "auto" ? "Automático" : t(theme === "dark" ? "modoClaro" : "modoEscuro")}</span>
            </button>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--bg-input)] transition-colors">
              <LogOutIcon className="w-4 h-4" /> <span>{t("sair")}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main id="main-content" className="flex-1 w-full md:ml-60 relative z-10">
        <div className="px-4 py-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-6 lg:px-8 dashboard-content">
          <PullToRefresh>
            {children}
          </PullToRefresh>
        </div>
      </main>

      <InstallPrompt />
      <OssTransition />
      <Ossinho role={role} pathname={pathname} />

      {/* MOBILE BOTTOM NAV */}
      <nav aria-label="Navegação móvel" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg)]/95 border-t border-[var(--border)] flex items-center justify-around px-1 pt-1 pb-[max(8px,env(safe-area-inset-bottom))] safe-area-bottom">
        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <button key={item.href} onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 min-w-[64px] min-h-[48px] transition-all ${isActive ? "text-[var(--gold)]" : "text-[var(--text-secondary)]"}`}>
              <div className={isActive ? "scale-110 transition-transform" : ""}><Icon active={isActive} /></div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.04em] ${isActive ? "text-[var(--gold)]" : "text-[var(--text-secondary)]"}`}>{t(item.tkey)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
