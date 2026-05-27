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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(reader.result as string)
      setUploading(false)
    }
    reader.onerror = () => { setUploading(false); alert("Erro ao ler arquivo") }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    fetch("/api/perfil").then((r) => r.json()).then((d) => {
      setData(d); setNome(d.nome); setTelefone(d.telefone || ""); setAvatarUrl(d.avatar || "")
    })
  }, [])

  async function salvar() {
    setSaving(true)
    const body: Record<string, string> = { nome, telefone }
    if (avatarUrl) body.avatar = avatarUrl
    await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    setEditando(false)
    setData((prev) => prev ? { ...prev, nome, telefone, avatar: avatarUrl } : prev)
  }

  if (!data) return null

  const isAluno = role === "aluno"

  return (
    <DashboardShell role={role}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="relative inline-block">
            <Avatar name={data.nome} faixa={data.faixa} size={72} src={data.avatar} />
            <button
              onClick={() => setEditando(!editando)}
              className="absolute -bottom-1 -right-1 w-6 h-6 gradient-gold rounded-full flex items-center justify-center text-[10px] text-black font-bold shadow-lg"
            >✎</button>
          </div>

          {!editando && (
            <button onClick={() => setEditando(true)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all">
              ✏️ Editar Perfil
            </button>
          )}

          {editando ? (
            <div className="mt-4 space-y-3 max-w-xs mx-auto">
              <input className="input-premium text-center" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
              <input className="input-premium text-center" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" />
              <div>
                <label className="text-[10px] text-[var(--white-muted)] font-semibold block mb-2">Avatar:</label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {["🥋", "🤼", "👊", "💪", "🔥", "⚡", "🦅", "🐯", "🦁", "🐺", "🛡️", "👑"].map((emoji) => (
                    <button key={emoji} type="button" onClick={() => setAvatarUrl(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${avatarUrl === emoji ? "bg-[var(--gold)] ring-2 ring-[var(--gold)]" : "bg-black/40 border border-[var(--dark-border)] hover:border-[var(--gold)]"}`}
                    >{emoji}</button>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border border-[var(--dark-border)] text-[var(--white-muted)] hover:text-white hover:border-[var(--gold)] transition-all mb-2">
                  {uploading ? "Enviando..." : "📸 Enviar foto"}
                </button>
              </div>
              <input className="input-premium text-center text-sm" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Ou cole URL da foto" />
              <div className="flex gap-2">
                <button onClick={salvar} disabled={saving} className="btn-gold flex-1 py-2.5 text-xs">{saving ? "Salvando..." : "Salvar"}</button>
                <button onClick={() => setEditando(false)} className="flex-1 py-2.5 rounded-xl text-xs border border-[var(--dark-border)] text-[var(--white-muted)]">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-extrabold tracking-tight mt-3">{data.nome}</h2>
              {isAluno && (
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2 ${getBeltColor(data.faixa)}`}>
                  {getBeltEmoji(data.faixa)} {data.faixa} · {data.grau + 1}º Grau
                </span>
              )}
              <p className="text-xs text-[var(--white-muted)] mt-2">{data.academia}</p>
              {data.telefone && <p className="text-xs text-[var(--white-muted)] mt-1">📞 {data.telefone}</p>}
              <p className="text-xs text-[var(--gray)] mt-1">{data.email}</p>
              {data.dataInicio && (
                <p className="text-xs text-[var(--gray)] mt-0.5">🥋 Desde {new Date(data.dataInicio).toLocaleDateString("pt-BR")}</p>
              )}
            </>
          )}
        </div>

        {isAluno && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
                <div className="text-2xl font-black gradient-gold-text">{data.totalAulas}</div>
                <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Total de Aulas</div>
              </div>
              <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
                <div className="text-2xl font-black gradient-gold-text">{data.totalPresencas}</div>
                <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Presenças</div>
              </div>
              <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
                <div className="text-2xl font-black gradient-gold-text">{data.thisMonth}</div>
                <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Aulas este Mês</div>
              </div>
              <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
                <div className="text-2xl font-black gradient-gold-text">{data.currentStreak}</div>
                <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Streak Atual</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
              <h3 className="font-bold text-sm tracking-tight mb-3">🔥 Streak</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--gold)]">{data.currentStreak}</div>
                  <div className="text-[10px] text-[var(--white-muted)]">Atual</div>
                </div>
                <div className="h-12 w-[1px] bg-[var(--dark-border)]" />
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--gold)]">{data.bestStreak}</div>
                  <div className="text-[10px] text-[var(--white-muted)]">Melhor</div>
                </div>
                <div className="h-12 w-[1px] bg-[var(--dark-border)]" />
                <div className="text-center">
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
