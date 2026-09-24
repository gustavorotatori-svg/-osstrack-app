"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { AwardIcon, CheckIcon, TrendingIcon, MessageIcon, BellIcon, GraduationIcon, XIcon } from "@/components/ui/icons"

type Notificacao = {
  id: string; tipo: string; titulo: string; descricao: string
  lida: boolean; link: string | null; createdAt: string
}

const FILTROS = [
  { key: "todas", label: "Todas" },
  { key: "nao_lida", label: "Não lidas" },
  { key: "conquista", label: "Conquistas" },
  { key: "presenca", label: "Presenças" },
  { key: "reengagement", label: "Lembretes" },
  { key: "sistema", label: "Sistema" },
]

export function NotificacoesClient({ role }: { role: string }) {
  const t = useT("notificacoes")
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [now] = useState(() => Date.now())
  const [filtro, setFiltro] = useState("todas")
  const router = useRouter()

  useEffect(() => {
    fetch("/api/notificacoes").then((r) => r.json()).then(setNotificacoes)
  }, [])

  const filtradas = useMemo(() => {
    if (filtro === "todas") return notificacoes
    if (filtro === "nao_lida") return notificacoes.filter((n) => !n.lida)
    return notificacoes.filter((n) => n.tipo === filtro)
  }, [notificacoes, filtro])

  async function marcarLida(id: string, link?: string | null) {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n))
    if (link) router.push(link)
  }

  async function marcarTodasLidas() {
    const naoLidas = notificacoes.filter((n) => !n.lida)
    if (naoLidas.length === 0) return
    await Promise.all(
      naoLidas.map((n) =>
        fetch("/api/notificacoes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        })
      )
    )
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    toast.success(`${naoLidas.length} notificações marcadas como lidas`)
  }

  async function aceitarProfessor(notificacaoId: string) {
    const res = await fetch("/api/professores/aceitar-vinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificacaoId, aceitar: true }),
    })
    if (res.ok) {
      toast.success(t("professorVinculado"))
      setNotificacoes((prev) => prev.map((n) => n.id === notificacaoId ? { ...n, lida: true } : n))
    } else {
      const data = await res.json()
      toast.error(data.error || t("erroAceitar"))
    }
  }

  async function recusarProfessor(notificacaoId: string) {
    const res = await fetch("/api/professores/aceitar-vinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificacaoId, aceitar: false }),
    })
    if (res.ok) {
      toast.success(t("solicitacaoRecusada"))
      setNotificacoes((prev) => prev.map((n) => n.id === notificacaoId ? { ...n, lida: true } : n))
    } else {
      toast.error(t("erroRecusar"))
    }
  }

  const naoLidas = notificacoes.filter((n) => !n.lida)

  const tipoIcon: Record<string, React.ReactNode> = {
    conquista: <AwardIcon className="w-5 h-5 text-[var(--gold)]" />,
    presenca: <CheckIcon className="w-5 h-5 text-emerald-400" />,
    promocao: <TrendingIcon className="w-5 h-5 text-blue-400" />,
    comentario: <MessageIcon className="w-5 h-5 text-[var(--gold)]" />,
    sistema: <BellIcon className="w-5 h-5 text-[var(--gold)]" />,
    solicitacao_professor: <GraduationIcon className="w-5 h-5 text-[var(--gold)]" />,
    vinculo_aceito: <CheckIcon className="w-5 h-5 text-emerald-400" />,
    vinculo_recusado: <XIcon className="w-5 h-5 text-red-400" />,
    reengagement: <BellIcon className="w-5 h-5 text-orange-400" />,
    drip_dia1: <BellIcon className="w-5 h-5 text-blue-400" />,
    drip_dia3: <BellIcon className="w-5 h-5 text-orange-400" />,
    drip_dia7: <BellIcon className="w-5 h-5 text-purple-400" />,
    drip_dia14: <BellIcon className="w-5 h-5 text-emerald-400" />,
  }

  function tempoRelativo(dateStr: string) {
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const dias = Math.floor(hrs / 24)
    if (dias < 7) return `${dias}d`
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  return (
    <DashboardShell role={role}>
      <div className="space-y-4">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-[var(--gold)]" />
              <div>
                <h3 className="font-bold">{t("title")}</h3>
                {naoLidas.length > 0 && (
                  <p className="text-xs text-[var(--gold)]">{naoLidas.length} não lida{naoLidas.length > 1 ? "s" : ""}</p>
                )}
              </div>
            </div>
            {naoLidas.length > 0 && (
              <button onClick={marcarTodasLidas}
                className="text-[10px] text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors font-semibold px-3 py-1.5 rounded-lg border border-[rgba(212,168,71,0.2)] hover:bg-[rgba(212,168,71,0.06)]">
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                filtro === f.key
                  ? "bg-[var(--gold)] text-black"
                  : "bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtradas.length === 0 ? (
          <div className="glass-card">
            <EmptyState icon="checkin" title="Silêncio por enquanto"
              description={filtro === "todas" ? "Toda novidade aparece aqui." : "Nenhuma notificação nesta categoria."} />
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map((n) => (
              <div
                key={n.id}
                className={`w-full text-left glass-card transition-all hover:border-[rgba(201,168,76,0.15)] ${
                  n.lida ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{tipoIcon[n.tipo] || <BellIcon className="w-5 h-5 text-[var(--gold)]" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{n.titulo}</span>
                      {!n.lida && <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--white-muted)] mt-0.5">{n.descricao}</p>
                    <span className="text-[10px] text-[var(--gray)] mt-1 block">
                      {tempoRelativo(n.createdAt)}
                    </span>
                    {n.tipo === "solicitacao_professor" && !n.lida && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => aceitarProfessor(n.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all active:scale-95">
                          <CheckIcon className="w-3.5 h-3.5" /> {t("aceitar")}
                        </button>
                        <button onClick={() => recusarProfessor(n.id)}
                          className="px-4 py-1.5 rounded-lg bg-red-700/20 text-red-400 text-xs font-bold hover:bg-red-700/30 transition-all active:scale-95 border border-red-700/30 flex items-center gap-1">
                          <XIcon className="w-3.5 h-3.5" /> {t("recusar")}
                        </button>
                      </div>
                    )}
                    {!n.lida && n.tipo !== "solicitacao_professor" && (
                      <button onClick={() => marcarLida(n.id, n.link)}
                        className="mt-2 text-[10px] text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors">
                        {n.link ? "Visualizar →" : t("marcarLida")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
