"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"

type Notificacao = {
  id: string; tipo: string; titulo: string; descricao: string
  lida: boolean; link: string | null; createdAt: string
}

export default function NotificacoesPage() {
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

  const naoLidas = notificacoes.filter((n) => !n.lida)

  const tipoIcon: Record<string, string> = {
    conquista: "🏆", presenca: "✅", promocao: "⬆️",
    comentario: "💬", sistema: "🔔",
  }

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">🔔</div>
          <h3 className="font-bold">Notificações</h3>
          {naoLidas.length > 0 && (
            <p className="text-xs text-[var(--gold)] mt-1">{naoLidas.length} não lidas</p>
          )}
        </div>

        {notificacoes.length === 0 ? (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl">
            <EmptyState icon="checkin" title="Silêncio por enquanto" description="Toda conquista, promoção e novidade aparece aqui. Continue treinando que as notificações vão chegar." />
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => (
              <button
                key={n.id}
                onClick={() => marcarLida(n.id, n.link)}
                className={`w-full text-left bg-gradient-to-br from-[var(--dark-card)] to-black/40 border rounded-2xl p-4 transition-all hover:border-[rgba(201,168,76,0.15)] ${
                  n.lida ? "border-[var(--dark-border)] opacity-60" : "border-[rgba(201,168,76,0.2)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lg shrink-0 mt-0.5">{tipoIcon[n.tipo] || "🔔"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{n.titulo}</span>
                      {!n.lida && <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--white-muted)] mt-0.5">{n.descricao}</p>
                    <span className="text-[10px] text-[var(--gray)] mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString("pt-BR")} · {new Date(n.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
