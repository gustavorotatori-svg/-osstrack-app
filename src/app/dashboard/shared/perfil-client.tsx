"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { PageTransition } from "@/components/ui/page-transition"
import { Camera, Pencil, Save, X, Download, Trash2 } from "lucide-react"
import { useT } from "@/lib/use-t"

import { getNivelInfo } from "@/lib/disciplina"

type PerfilData = {
  id: string; nome: string; email: string; telefone: string | null; avatar: string | null
  faixa: string; grau: number; dataInicio: string | null
  academia: string; totalAulas: number; totalPresencas: number
  thisMonth: number; currentStreak: number; bestStreak: number
  nivelDisciplina: string | null
  familia: {
    id: string; nome: string; desconto: number
    membros: { id: string; nome: string; faixa: string; grau: number }[]
  } | null
}

const emojis = ["🥋", "🤼", "👊", "💪", "🔥", "⚡", "🦅", "🐯", "🦁", "🐺", "🛡️", "👑"]

export default function PerfilClient({ role }: { role: string }) {
  const t = useT("perfilPage")
  const { data: session } = useSession()
  const [data, setData] = useState<PerfilData | null>(null)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/perfil").then((r) => r.json()).then((d) => {
      setData(d); setNome(d.nome); setTelefone(d.telefone || ""); setDataNascimento(d.dataNascimento || ""); setAvatarUrl(d.avatar || "")
    })
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert(t("max5mb")); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => { setAvatarUrl(reader.result as string); setUploading(false) }
    reader.onerror = () => { setUploading(false); alert(t("erroLerArquivo")) }
    reader.readAsDataURL(file)
  }

  async function salvar() {
    setSaving(true)
    const body: Record<string, string> = { nome, telefone, dataNascimento }
    if (avatarUrl) body.avatar = avatarUrl
    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(t("erroSalvar"))
      setData((prev) => prev ? { ...prev, nome, telefone, avatar: avatarUrl } : prev)
      setEditando(false)
    } catch {
      alert(t("erroSalvar"))
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
        <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 space-y-4 text-center">
            <div className="belt-loading rounded-full w-20 h-20 mx-auto" />
            <div className="belt-loading rounded-lg h-6 w-32 mx-auto" />
            <div className="belt-loading rounded-lg h-4 w-48 mx-auto" />
          </div>
          <div className="belt-loading rounded-lg h-10 w-full" />
        </div>
      </DashboardShell>
    )
  }

  const isAluno = role === "aluno"

  return (
    <DashboardShell role={role}>
      <PageTransition>
        <div className="max-w-lg mx-auto space-y-5">
          <div className="glass-card p-6 text-center relative overflow-hidden">
            <div className="relative inline-block group">
              <Avatar name={data.nome} faixa={data.faixa} size={88} src={data.avatar} />
              <button onClick={() => setEditando(!editando)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs text-black font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "var(--gold)" }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight mt-4">{data.nome}</h2>
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-bold text-sm section-header mb-0">{t("dadosPrivacidade")}</h3>
            <button onClick={async () => {
              try {
                const res = await fetch("/api/conta")
                if (!res.ok) { alert(t("erroExportar")); return }
                const data = await res.json()
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a"); a.href = url; a.download = "meus-dados-osstrack.json"; a.click()
                URL.revokeObjectURL(url)
              } catch { alert(t("erroExportar")) }
            }}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-input)] active:scale-[0.97]"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <Download className="w-4 h-4" /> {t("exportarDados")}
            </button>
            <button onClick={() => {
              if (window.confirm(t("confirmarExcluir"))) {
                fetch("/api/conta", { method: "DELETE" }).then(async (res) => {
                  if (res.ok) { window.location.href = "/" }
                  else { const d = await res.json(); alert(d.error || t("erroExcluir")) }
                }).catch(() => alert(t("erroExcluir")))
              }
            }}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 active:scale-[0.97] btn-danger">
              <Trash2 className="w-4 h-4" /> {t("excluirConta")}
            </button>
          </div>

          {isAluno && (
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2 ${getBeltColor(data.faixa)}`}>
                {getBeltEmoji(data.faixa)} {data.faixa} · {data.grau + 1}º Grau
              </span>
            )}
            {isAluno && getNivelInfo(data.nivelDisciplina) && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(212,168,71,0.1)", border: "1px solid rgba(212,168,71,0.2)", color: "var(--gold)" }}>
                  {getNivelInfo(data.nivelDisciplina)!.icone} {getNivelInfo(data.nivelDisciplina)!.label}
                </span>
              </div>
            )}
            <p className="text-xs text-[var(--text-secondary)] mt-3">{data.academia || t("semAcademia")}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{data.email}</p>
            {data.dataInicio && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">🥋 Desde {new Date(data.dataInicio).toLocaleDateString("pt-BR")}</p>
            )}
          </div>

          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] btn-gold">
              <Pencil className="w-4 h-4 inline mr-2" />{t("editarPerfil")}
            </button>
          ) : (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm section-header mb-0">{t("editarPerfil")}</h3>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("nome")}</label>
                <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("telefone")}</label>
                <input className="input-field" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={t("telefonePlaceholder")} />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("dataNascimento")}</label>
                <input type="date" className="input-field" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">{t("fotoAvatar")}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {emojis.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => selecionarAvatar(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${avatarUrl === emoji ? "scale-110" : "border hover:border-[var(--gold)]"}`}
                      style={avatarUrl === emoji ? { background: "var(--gold)", outline: "2px solid var(--gold)" } : { background: "rgba(255,255,255,0.03)", borderColor: "var(--border)" }}
                    >{emoji}</button>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full py-3 rounded-xl text-sm font-medium border border-dashed transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  <Camera className="w-4 h-4 inline mr-2" />{uploading ? t("enviando") : t("clicarEnviar")}
                </button>
                <input className="input-field mt-3 text-sm" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder={t("colarLink")} />
                {avatarUrl && avatarUrl.startsWith("data:") && (
                  <p className="text-[10px] text-emerald-400 mt-1">{t("fotoCarregada")}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={salvar} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-all active:scale-[0.97] btn-gold">
                  <Save className="w-4 h-4 inline mr-2" />{saving ? t("salvando") : t("salvar")}
                </button>
                <button onClick={() => { setEditando(false); setAvatarUrl(data.avatar || "") }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all btn-ghost">
                  <X className="w-4 h-4 inline mr-2" />{t("cancelar")}
                </button>
              </div>
            </div>
          )}

          {isAluno && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-glass">
                  <div className="stat-glass-value"><span>{data.totalAulas}</span></div>
                  <div className="stat-glass-label">{t("totalAulas")}</div>
                </div>
                <div className="stat-glass">
                  <div className="stat-glass-value"><span>{data.totalPresencas}</span></div>
                  <div className="stat-glass-label">{t("presencas")}</div>
                </div>
                <div className="stat-glass">
                  <div className="stat-glass-value"><span>{data.thisMonth}</span></div>
                  <div className="stat-glass-label">{t("aulasEsteMes")}</div>
                </div>
                <div className="stat-glass">
                  <div className="stat-glass-value"><span>{data.currentStreak}</span></div>
                  <div className="stat-glass-label">{t("streakAtual")}</div>
                </div>
              </div>

              {data.familia && (
                <div className="glass-card p-5">
                  <h3 className="font-bold text-sm section-header mb-3">
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {data.familia.nome}
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">
                    Desconto familiar de <span className="text-[var(--gold)] font-bold">{data.familia.desconto}%</span>
                  </p>
                  <div className="space-y-1.5">
                    {data.familia.membros
                      .filter((m) => m.id !== data.id)
                      .map((m) => (
                        <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--dark-card)]">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(m.faixa)}`}>
                            {m.faixa}
                          </span>
                          <span className="text-sm">{m.nome}</span>
                        </div>
                      ))}
                    {data.familia.membros.filter((m) => m.id !== data.id).length === 0 && (
                      <p className="text-xs text-[var(--text-muted)]">Você é o único membro desta família</p>
                    )}
                  </div>
                </div>
              )}

              <div className="glass-card p-5">
                <div className="section-header">🔥 Streak</div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold" style={{ color: "var(--gold)" }}>{data.currentStreak}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{t("atual")}</div>
                  </div>
                  <div className="h-10 w-px" style={{ background: "var(--border)" }} />
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold" style={{ color: "var(--gold)" }}>{data.bestStreak}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{t("melhor")}</div>
                  </div>
                  <div className="h-10 w-px" style={{ background: "var(--border)" }} />
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold text-emerald-500">{data.totalAulas > 0 ? Math.round((data.thisMonth / data.totalAulas) * 100) : 0}%</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{t("doTotal")}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}