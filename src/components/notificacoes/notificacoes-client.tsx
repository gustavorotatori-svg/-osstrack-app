"use client"

import { useState, useEffect } from "react"
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

export function NotificacoesClient({ role }: { role: string }) {
  const t = useT("notificacoes")
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch("/api/notificacoes").then((r) => r.json()).then(setNotificacoes)
  }, [])

  async function marcarLida(id: string, link?: string | null) {
    await fetch("/api/notificacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n))
    if (link) router.push(link)
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
  }

  return (
    <DashboardShell role={role}>
      <div className="space-y-4">
        <div className="glass-card text-center">
          <BellIcon className="w-8 h-8 mx-auto mb-2 text-[var(--gold)]" />
          <h3 className="font-bold">{t("title")}</h3>
          {naoLidas.length > 0 && (
            <p className="text-xs text-[var(--gold)] mt-1">{naoLidas.length} não lidas</p>
          )}
        </div>

        {notificacoes.length === 0 ? (
          <div className="glass-card">
            <EmptyState icon="checkin" title="Silêncio por enquanto"
              description="Toda conquista, promoção e novidade aparece aqui." />
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => (
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
                      {new Date(n.createdAt).toLocaleDateString("pt-BR")} · {new Date(n.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
