"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { BadgeCard } from "@/components/gamification/badge-card"
import { PageTransition } from "@/components/ui/page-transition"
import { useT } from "@/lib/use-t"
import { DumbbellIcon, FlameIcon, StarIcon, HandshakeIcon, GraduationIcon, AwardIcon, GiftIcon, ClipboardIcon, SearchIcon } from "@/components/ui/icons"

type ConquistaData = {
  id: string
  nome: string
  icone: string
  iconeBloqueado: string
  descricao: string
  tipo: string
  categoria: string
  condicao: number
  nivel: number
  nivelLabel: string
  raridade: string
  progressoMax: number
  desbloqueada: boolean
  progresso: number
  progressoAtual?: number
}

type Props = {
  conquistas: ConquistaData[]
}

export function AchievementsClient({ conquistas }: Props) {
  const t = useT("aluno.conquistas")

  const categorias: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
    presenca:   { label: t("categorias.presenca"),   icon: <DumbbellIcon className="w-4 h-4" />, desc: t("categorias.presencaDesc") },
    streak:     { label: t("categorias.streak"),     icon: <FlameIcon className="w-4 h-4" />, desc: t("categorias.streakDesc") },
    especial:   { label: t("categorias.especial"),   icon: <StarIcon className="w-4 h-4" />, desc: t("categorias.especialDesc") },
    social:     { label: t("categorias.social"),     icon: <HandshakeIcon className="w-4 h-4" />, desc: t("categorias.socialDesc") },
    graduacao:  { label: t("categorias.graduacao"),  icon: <GraduationIcon className="w-4 h-4" />, desc: t("categorias.graduacaoDesc") },
  }
  const [catFilter, setCatFilter] = useState("todas")
  const [showBloqueadas, setShowBloqueadas] = useState(true)

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada)
  const filtered = catFilter === "todas"
    ? conquistas
    : conquistas.filter((c) => c.categoria === catFilter)

  const visible = showBloqueadas ? filtered : filtered.filter((c) => c.desbloqueada)

  // Stats por categoria
  const catStats = Object.entries(categorias).map(([key, val]) => {
    const cat = conquistas.filter((c) => c.categoria === key)
    const desb = cat.filter((c) => c.desbloqueada)
    return { key, ...val, total: cat.length, desbloqueadas: desb.length }
  })

  const progressoGeral = conquistas.length > 0
    ? Math.round((desbloqueadas.length / conquistas.length) * 100)
    : 0

  return (
    <DashboardShell role="aluno">
      <PageTransition>
        <div className="space-y-4">
          {/* Header com progresso geral */}
          <div className="glass-card-gold p-5 text-center relative overflow-hidden">
            <AwardIcon className="absolute top-[-20px] right-[-20px] w-16 h-16 opacity-[0.04]" />
            <GiftIcon className="w-8 h-8 mb-1 mx-auto" />
            <h3 className="font-bold text-base">{t("title")}</h3>
            <p className="text-xs text-[var(--white-muted)] mt-0.5">
              {t("desbloqueadas").replace("{n}", String(desbloqueadas.length)).replace("{total}", String(conquistas.length))}
            </p>
            <div className="progress-gold max-w-xs mx-auto mt-3">
              <div className="progress-gold-fill" style={{ width: `${progressoGeral}%` }} />
            </div>
            <div className="text-[10px] text-[var(--gold)] font-semibold mt-1">{t("porcentoCompleto").replace("{n}", String(progressoGeral))}</div>
          </div>

          {/* Stats por categoria */}
          <div className="grid grid-cols-3 gap-2">
            {catStats.map((cat) => (
              <div key={cat.key} className="glass-card text-center p-3">
                <div className="flex justify-center">{cat.icon}</div>
                <div className="text-xs font-bold mt-1">{cat.label}</div>
                <div className="text-[10px] text-[var(--white-muted)]">{cat.desbloqueadas}/{cat.total}</div>
                <div className="h-1 bg-[var(--dark-border)] rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold)] transition-all"
                    style={{ width: `${cat.total > 0 ? (cat.desbloqueadas / cat.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => setCatFilter("todas")}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                catFilter === "todas" ? "gradient-gold text-black shadow-md" : "bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)]/30"
              }`}>
              <ClipboardIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("todas")}
            </button>
            {Object.entries(categorias).map(([key, val]) => (
              <button key={key} onClick={() => setCatFilter(key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                  catFilter === key ? "gradient-gold text-black shadow-md" : "bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--white-muted)]"
                }`}>
                <span className="inline-flex items-center gap-1">{val.icon} {val.label}</span>
              </button>
            ))}
          </div>

          {/* Toggle mostrar bloqueadas */}
          <div className="flex items-center justify-between glass-card p-3">
            <div className="text-xs font-semibold">{t("mostrarBloqueadas")}</div>
            <button
              onClick={() => setShowBloqueadas(!showBloqueadas)}
              className={`relative w-10 h-6 rounded-full transition-all ${showBloqueadas ? "bg-emerald-600" : "bg-[var(--dark-border)]"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${showBloqueadas ? "left-4.5" : "left-0.5"}`} />
            </button>
          </div>

          {/* Grid de badges */}
          <div className="grid grid-cols-4 gap-2">
            {visible.map((c) => (
              <BadgeCard
                key={c.id}
                nome={c.nome}
                icone={c.icone}
                iconeBloqueado={c.iconeBloqueado}
                descricao={c.descricao}
                nivelLabel={c.nivelLabel}
                raridade={c.raridade}
                desbloqueada={c.desbloqueada}
                progresso={c.progresso}
                progressoMax={c.progressoMax}
                progressoAtual={c.progressoAtual}
              />
            ))}
          </div>

          {visible.length === 0 && (
            <div className="glass-card text-center py-10">
              <SearchIcon className="w-10 h-10 mb-2 mx-auto" />
              <p className="text-sm text-[var(--white-muted)]">{t("nenhumaEncontrada")}</p>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}
