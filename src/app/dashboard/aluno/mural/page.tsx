"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

const beltColors: Record<string, string> = {
  Branca: "bg-gray-100 text-gray-900", Azul: "bg-blue-700 text-white",
  Roxa: "bg-purple-700 text-white", Marrom: "bg-amber-800 text-white",
  Preta: "bg-black text-yellow-400 border border-gray-600",
}

type Postagem = {
  id: string; aluno: { id: string; nome: string; faixa: string; grau: number }
  tipo: string; conteudo: string; createdAt: string
  comentarios: Comentario[]
}

type Comentario = {
  id: string; usuario: { id: string; nome: string; faixa: string }
  conteudo: string; createdAt: string
}

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/15 border border-red-600/20 text-[10px] font-bold text-red-500 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      Ao Vivo
    </div>
  )
}

export default function MuralPage() {
  const { data: session } = useSession()
  const [postagens, setPostagens] = useState<Postagem[]>([])
  const [comentariosAbertos, setComentariosAbertos] = useState<Record<string, boolean>>({})
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({})
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])
  const [showLiveFeed, setShowLiveFeed] = useState(false)

  useEffect(() => {
    fetch("/api/mural")
      .then((r) => r.json())
      .then(setPostagens)
      .catch(() => {})

    fetch("/api/treino")
      .then((r) => r.json())
      .then((data) => setTreinandoAgora(data.treinando || []))
      .catch(() => {})

    const id = setInterval(() => {
      fetch("/api/mural")
        .then((r) => r.json())
        .then(setPostagens)
        .catch(() => {})
      fetch("/api/treino")
        .then((r) => r.json())
        .then((data) => setTreinandoAgora(data.treinando || []))
        .catch(() => {})
    }, 15000)
    return () => clearInterval(id)
  }, [])

  async function enviarComentario(postagemId: string) {
    const conteudo = novoComentario[postagemId]?.trim()
    if (!conteudo) return

    const res = await fetch("/api/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postagemId, conteudo }),
    })

    if (res.ok) {
      const comentario = await res.json()
      setPostagens((prev) => prev.map((p) =>
        p.id === postagemId ? { ...p, comentarios: [...p.comentarios, comentario] } : p
      ))
      setNovoComentario((prev) => ({ ...prev, [postagemId]: "" }))
    }
  }

  const feed = postagens.length > 0 ? postagens : [
    { id: "1", aluno: { id: "m1", nome: "Lucas Costa", faixa: "Roxa", grau: 1 }, tipo: "milestone", conteudo: "completou 150 aulas! 🎉", createdAt: new Date(Date.now() - 7200000).toISOString(), comentarios: [] },
    { id: "2", aluno: { id: "m2", nome: "Maria Fernandes", faixa: "Azul", grau: 1 }, tipo: "achievement", conteudo: "ganhou a medalha Dedicação 🔥", createdAt: new Date(Date.now() - 18000000).toISOString(), comentarios: [] },
  ]

  const checkinsHoje = feed.filter((p) => p.tipo === "checkin")
  const outrasPostagens = feed.filter((p) => p.tipo !== "checkin")

  const tipoEmoji: Record<string, string> = {
    milestone: "🎉", achievement: "🏆", streak: "🔥",
    promotion: "⬆️", first: "🎯", checkin: "🥋",
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}m atrás`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold">Mural da Academia</h3>
          <p className="text-xs text-[var(--white-muted)]">Acompanhe as conquistas dos colegas</p>
        </div>

        {/* Live agora */}
        {treinandoAgora.length > 0 && (
          <div className="bg-gradient-to-br from-[rgba(220,38,38,0.04)] to-[rgba(220,38,38,0.01)] border border-[rgba(220,38,38,0.12)] rounded-2xl p-5 hover-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Treinando agora
              </h3>
              <LiveBadge />
            </div>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.12)] rounded-xl px-3 py-1.5 text-xs animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--white-muted)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-ins ao vivo */}
        {checkinsHoje.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--white-muted)] font-semibold tracking-wide uppercase px-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Check-ins recentes
            </div>
            {checkinsHoje.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-[rgba(16,185,129,0.04)] to-black/20 border border-[rgba(16,185,129,0.1)] rounded-xl p-3 flex items-center gap-3 animate-slide-in-left" style={{ animationDuration: "0.4s" }}>
                <Avatar name={item.aluno.nome} faixa={item.aluno.faixa} mood={item.aluno.faixa === "Preta" ? "fire" : "normal"} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{item.aluno.nome}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${beltColors[item.aluno.faixa] || "bg-gray-100 text-gray-900"}`}>
                      {item.aluno.faixa}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--white-muted)] mt-0.5">chegou para treinar! 🥋</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {timeAgo(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feed principal */}
        <div className="space-y-3">
          {outrasPostagens.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 hover-card">
              <div className="flex items-start gap-3.5">
                <Avatar name={item.aluno.nome} faixa={item.aluno.faixa} size={40}
                  mood={item.tipo === "streak" || item.tipo === "milestone" ? "fire" : item.tipo === "achievement" || item.tipo === "promotion" ? "party" : "normal"}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{item.aluno.nome}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${beltColors[item.aluno.faixa] || "bg-gray-100 text-gray-900"}`}>
                      {item.aluno.faixa} · {item.aluno.grau + 1}º
                    </span>
                  </div>
                  <p className="text-sm text-[var(--white-muted)] mt-1">{tipoEmoji[item.tipo] || "📌"} {item.conteudo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--gray)]">{timeAgo(item.createdAt)}</span>
                    <button
                      onClick={() => setComentariosAbertos((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="text-[10px] text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors font-semibold"
                    >
                      💬 {item.comentarios.length} comentários
                    </button>
                  </div>

                  {comentariosAbertos[item.id] && (
                    <div className="mt-3 pt-3 border-t border-[var(--dark-border)] space-y-2">
                      {item.comentarios.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <Avatar name={c.usuario.nome} faixa={c.usuario.faixa} size={24} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold">{c.usuario.nome}</span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${beltColors[c.usuario.faixa] || "bg-gray-100"}`}>
                                {c.usuario.faixa}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--white-muted)] mt-0.5">{c.conteudo}</p>
                            <span className="text-[9px] text-[var(--gray)]">{timeAgo(c.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          className="flex-1 bg-black/40 border border-[var(--dark-border)] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[var(--gray)] focus:outline-none focus:border-[var(--gold)]"
                          placeholder="Escreva um comentário..."
                          value={novoComentario[item.id] || ""}
                          onChange={(e) => setNovoComentario((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && enviarComentario(item.id)}
                        />
                        <button
                          onClick={() => enviarComentario(item.id)}
                          className="btn-gold px-3 py-2 text-xs shrink-0"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
