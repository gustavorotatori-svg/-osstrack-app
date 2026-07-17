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
  tipo: string; conteudo: string; imagem?: string; createdAt: string
  curtidas: number; curtido: boolean
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

export default function MuralFeed({ role }: { role: string }) {
  const { data: session } = useSession()
  const [postagens, setPostagens] = useState<Postagem[]>([])
  const [comentariosAbertos, setComentariosAbertos] = useState<Record<string, boolean>>({})
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({})
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])

  useEffect(() => {
    fetch("/api/mural").then((r) => r.json()).then(setPostagens).catch((e) => console.error("mural", e))
    fetch("/api/treino").then((r) => r.json()).then((data) => setTreinandoAgora(data.treinando || [])).catch((e) => console.error("treino", e))

    const id = setInterval(() => {
      fetch("/api/mural").then((r) => r.json()).then(setPostagens).catch((e) => console.error("mural poll", e))
      fetch("/api/treino").then((r) => r.json()).then((data) => setTreinandoAgora(data.treinando || [])).catch((e) => console.error("treino poll", e))
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

  async function toggleCurtida(postagemId: string) {
    const res = await fetch(`/api/mural/${postagemId}/curtir`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      setPostagens((prev) => prev.map((p) =>
        p.id === postagemId ? { ...p, curtidas: data.curtidas, curtido: data.liked } : p
      ))
    }
  }

  const feed = postagens

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

  const checkinsHoje = feed.filter((p) => p.tipo === "checkin")
  const outrasPostagens = feed.filter((p) => p.tipo !== "checkin")

  return (
    <DashboardShell role={role}>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="surface p-5 text-center">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold">Mural da Academia</h3>
          <p className="text-xs text-[var(--text-secondary)]">Acompanhe as conquistas dos colegas</p>
        </div>

        {treinandoAgora.length > 0 && (
          <div className="surface p-5" style={{borderColor: 'rgba(220,38,38,0.12)'}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Treinando agora
              </h3>
              <LiveBadge />
            </div>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--red-dim)] border border-[var(--red)]/20 rounded-xl px-3 py-1.5 text-xs animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--text-secondary)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkinsHoje.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold tracking-wide uppercase px-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Check-ins recentes
            </div>
            {checkinsHoje.slice(0, 5).map((item) => (
              <div key={item.id} className="surface p-3 flex items-center gap-3" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
                <Avatar name={item.aluno.nome} faixa={item.aluno.faixa} mood={item.aluno.faixa === "Preta" ? "fire" : "normal"} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{item.aluno.nome}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${beltColors[item.aluno.faixa] || "bg-gray-100 text-gray-900"}`}>
                      {item.aluno.faixa}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">chegou para treinar! 🥋</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {timeAgo(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {outrasPostagens.map((item) => (
            <div key={item.id} className="surface p-4">
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
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{tipoEmoji[item.tipo] || "📌"} {item.conteudo}</p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(item.createdAt)}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCurtida(item.id)}
                        className={`text-xs font-semibold transition-all micro-press flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] ${
                          item.curtido ? "text-red-400" : "text-[var(--text-muted)] hover:text-red-400"
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={item.curtido ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {item.curtidas > 0 && item.curtidas}
                      </button>
                      <button
                        onClick={() => setComentariosAbertos((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className="text-xs text-[var(--red)] hover:text-[var(--red)] transition-colors font-semibold flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px]"
                      >
                        💬 {item.comentarios.length}
                      </button>
                    </div>
                  </div>

                  {comentariosAbertos[item.id] && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
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
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.conteudo}</p>
                            <span className="text-[9px] text-[var(--text-muted)]">{timeAgo(c.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <input
                          className="input flex-1"
                          placeholder="Escreva um comentário..."
                          value={novoComentario[item.id] || ""}
                          onChange={(e) => setNovoComentario((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && enviarComentario(item.id)}
                        />
                        <button
                          onClick={() => enviarComentario(item.id)}
                          className="btn-primary px-3 py-2 text-xs shrink-0"
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
