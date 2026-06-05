"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type PerfilData = {
  nome: string; email: string; telefone: string | null; avatar: string | null
  faixa: string; grau: number; dataInicio: string | null
  academia: string; totalAulas: number; totalPresencas: number
  thisMonth: number; currentStreak: number; bestStreak: number
}

const emojis = ["🥋", "🤼", "👊", "💪", "🔥", "⚡", "🦅", "🐯", "🦁", "🐺", "🛡️", "👑"]

export default function PerfilClient({ role }: { role: string }) {
  const { data: session } = useSession()
  const [data, setData] = useState<PerfilData | null>(null)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/perfil").then((r) => r.json()).then((d) => {
      setData(d); setNome(d.nome); setTelefone(d.telefone || ""); setAvatarUrl(d.avatar || "")
    })
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => { setAvatarUrl(reader.result as string); setUploading(false) }
    reader.onerror = () => { setUploading(false); alert("Erro ao ler arquivo") }
    reader.readAsDataURL(file)
  }

  async function salvar() {
    setSaving(true)
    const body: Record<string, string> = { nome, telefone }
    if (avatarUrl) body.avatar = avatarUrl
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      setData((prev) => prev ? { ...prev, nome, telefone, avatar: avatarUrl } : prev)
      setEditando(false)
    } catch {
      alert("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  function selecionarAvatar(url: string) {
    setAvatarUrl(avatarUrl === url ? "" : url)
  }

  if (!data) {
    return (
      <DashboardShell role={role}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  const isAluno = role === "aluno"

  return (
    <DashboardShell role={role}>
      <div className="max-w-lg mx-auto space-y-5">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="relative inline-block group">
            <Avatar name={data.nome} faixa={data.faixa} size={88} src={data.avatar} />
            <button onClick={() => setEditando(!editando)}
              className="absolute -bottom-1 -right-1 w-7 h-7 gradient-gold rounded-full flex items-center justify-center text-xs text-black font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              ✎
            </button>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight mt-4">{data.nome}</h2>
          {isAluno && (
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2 ${getBeltColor(data.faixa)}`}>
              {getBeltEmoji(data.faixa)} {data.faixa} · {data.grau + 1}º Grau
            </span>
          )}
          <p className="text-xs text-[var(--white-muted)] mt-3">{data.academia || "Sem academia"}</p>
          <p className="text-xs text-[var(--gray)] mt-1">{data.email}</p>
          {data.dataInicio && (
            <p className="text-xs text-[var(--gray)] mt-0.5">🥋 Desde {new Date(data.dataInicio).toLocaleDateString("pt-BR")}</p>
          )}
        </div>

        {!editando ? (
          <button onClick={() => setEditando(true)}
            className="w-full py-3.5 rounded-xl text-sm font-bold btn-gold">
            ✏️ Editar Perfil
          </button>
        ) : (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">Editar Perfil</h3>

            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Nome</label>
              <input className="input-premium" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Telefone</label>
              <input className="input-premium" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(81) 99999-8888" />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-2">Foto ou avatar</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {emojis.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => selecionarAvatar(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${avatarUrl === emoji ? "bg-[var(--gold)] ring-2 ring-[var(--gold)] scale-110" : "bg-black/40 border border-[var(--dark-border)] hover:border-[var(--gold)]"}`}
                  >{emoji}</button>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full py-3 rounded-xl text-sm font-medium border border-dashed border-[var(--dark-border-light)] text-[var(--white-muted)] hover:border-[var(--gold)] hover:text-white transition-all">
                {uploading ? "⏳ Enviando..." : "📸 Clique para enviar uma foto"}
              </button>
              <input className="input-premium mt-3 text-sm" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Ou cole o link de uma imagem" />
              {avatarUrl && avatarUrl.startsWith("data:") && (
                <p className="text-[10px] text-emerald-400 mt-1">✅ Foto carregada</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={salvar} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold btn-gold disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => { setEditando(false); setAvatarUrl(data.avatar || "") }}
                className="flex-1 py-3 rounded-xl text-sm font-medium border border-[var(--dark-border)] text-[var(--white-muted)] hover:text-white transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {isAluno && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total de Aulas", value: data.totalAulas },
                { label: "Presenças", value: data.totalPresencas },
                { label: "Aulas este Mês", value: data.thisMonth },
                { label: "Streak Atual", value: data.currentStreak },
              ].map((s) => (
                <div key={s.label} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black gradient-gold-text">{s.value}</div>
                  <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-3">🔥 Streak</h3>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-[var(--gold)]">{data.currentStreak}</div>
                  <div className="text-[10px] text-[var(--white-muted)]">Atual</div>
                </div>
                <div className="h-10 w-px bg-[var(--dark-border)]" />
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-[var(--gold)]">{data.bestStreak}</div>
                  <div className="text-[10px] text-[var(--white-muted)]">Melhor</div>
                </div>
                <div className="h-10 w-px bg-[var(--dark-border)]" />
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-emerald-500">{data.totalAulas > 0 ? Math.round((data.thisMonth / data.totalAulas) * 100) : 0}%</div>
                  <div className="text-[10px] text-[var(--white-muted)]">do Total</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
