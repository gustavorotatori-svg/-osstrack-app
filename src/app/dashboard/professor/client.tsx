"use client"

import { useState, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  professor: { nome: string; faixa: string; grau: number }
  alunos: { id: string; nome: string; faixa: string; grau: number }[]
  turmas: { id: string; nome: string; horario: string; dias: string; maxAlunos: number; totalAlunos: number }[]
  presencasHoje: { id: string; aluno: { id: string; nome: string; faixa: string }; data: string; horario: string; status: string; turma: string }[]
}

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function ProfessorDashboardClient({ professor, alunos, turmas, presencasHoje }: Props) {
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState("")
  const [whatsappLink, setWhatsappLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [gerando, setGerando] = useState(false)

  async function confirmarPresenca(presencaId: string, status: string) {
    await fetch("/api/presenca/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presencaId, status }),
    })
  }

  async function promover(alunoId: string, novaFaixa: string, novoGrau: number) {
    await fetch("/api/promocao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, novaFaixa, novoGrau }),
    })
    setPromovendo(null)
    setShowPromote(null)
  }

  const faixasDisponiveis = (faixaAtual: string) => {
    const idx = beltList.indexOf(faixaAtual)
    return beltList.slice(idx)
  }

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-3.5 shadow-lg">
            {professor.nome.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Prof. {professor.nome}</h2>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2.5 belt-black">
            ⬛ {professor.faixa} · {professor.grau}º Grau
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: alunos.length, label: "Alunos", icon: "👥", color: "text-[var(--gold)]" },
            { value: presencasHoje.filter(p => p.status === "confirmed").length, label: "Presentes Hoje", icon: "✅", color: "text-emerald-500" },
            { value: presencasHoje.filter(p => p.status === "pending").length, label: "Pendentes", icon: "⏳", color: "text-yellow-500" },
          ].map((s, i) => (
            <div key={s.label} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-lg mb-1.5">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm tracking-tight">📋 Presenças de Hoje</h3>
            <span className="badge-gold text-[10px]">{presencasHoje.length} registros</span>
          </div>
          {presencasHoje.length === 0 ? (
            <p className="text-sm text-[var(--white-muted)] text-center py-6">Nenhum check-in hoje</p>
          ) : (
            <div className="space-y-1">
              {presencasHoje.map((p) => (
                <div key={p.id} className="flex items-center gap-3.5 py-2.5 px-3 rounded-xl border border-transparent hover:bg-[var(--dark-border)]/30 transition-all">
                  <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.aluno.nome}</div>
                    <div className="text-[11px] text-[var(--white-muted)]">{p.aluno.faixa} · {p.turma} · {p.horario}</div>
                  </div>
                  {p.status === "confirmed" ? (
                    <span className="badge-emerald text-[10px] shrink-0">Presente</span>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => confirmarPresenca(p.id, "confirmed")} className="w-8 h-8 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-all">✓</button>
                      <button onClick={() => confirmarPresenca(p.id, "rejected")} className="w-8 h-8 rounded-xl bg-red-700/80 hover:bg-red-700 text-white flex items-center justify-center text-xs font-bold transition-all">✗</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <h3 className="font-bold text-sm tracking-tight mb-3.5">👥 Meus Alunos</h3>
          {alunos.map((a) => (
            <div key={a.id} className="flex items-center gap-3.5 py-2.5 px-3 rounded-xl border border-transparent hover:bg-[var(--dark-border)]/30 transition-all">
              <Avatar name={a.nome} faixa={a.faixa} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{a.nome}</div>
                <div className="text-[11px] text-[var(--white-muted)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
              </div>
              {showPromote === a.id ? (
                <div className="flex gap-1.5 shrink-0">
                  <select
                    className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-[10px] px-1 py-1 text-white"
                    value={promovendo?.split("|")[1] || a.faixa}
                    onChange={(e) => setPromovendo(`${a.id}|${e.target.value}|${a.grau}`)}
                  >
                    {faixasDisponiveis(a.faixa).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const parts = (promovendo || `${a.id}|${a.faixa}|${a.grau}`).split("|")
                      const novaFaixa = parts[1]
                      const novoGrau = a.faixa !== novaFaixa ? 0 : Math.min(a.grau + 1, 4)
                      promover(a.id, novaFaixa, novoGrau)
                    }}
                    className="w-8 h-8 rounded-xl gradient-gold text-black flex items-center justify-center text-xs font-bold"
                  >
                    ✓
                  </button>
                  <button onClick={() => setShowPromote(null)} className="w-8 h-8 rounded-xl bg-[var(--dark-border)] text-[var(--white-muted)] flex items-center justify-center text-xs">✗</button>
                </div>
              ) : (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowPromote(a.id)}
                    className="btn-gold px-3 py-1.5 text-[10px]"
                  >
                    Promover
                  </button>
                  <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <h3 className="font-bold text-sm tracking-tight mb-3.5">📅 Minhas Turmas</h3>
          {turmas.map((t) => (
            <div key={t.id} className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4 mb-3 last:mb-0 transition-all hover:border-[rgba(201,168,76,0.15)]">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-sm">{t.nome}</h4>
                <span className="badge text-[10px] text-[var(--white-muted)] bg-[var(--dark-border)]">{t.totalAlunos}/{t.maxAlunos}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--white-muted)]">
                <span>🕐 {t.horario}</span>
                <span>📅 {t.dias}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <h3 className="font-bold text-sm tracking-tight mb-3.5">📲 Convidar Alunos</h3>
          <p className="text-xs text-[var(--white-muted)] mb-3">Gere um link para compartilhar com seus alunos:</p>
          <div className="flex gap-2 mb-2">
            <input type="text" value={gerando ? "Gerando..." : inviteLink || "osstrack.app"} readOnly className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm" />
            <button type="button" disabled={gerando} onClick={async () => {
              setGerando(true)
              const res = await fetch("/api/convites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "aluno" }) })
              if (res.ok) { const d = await res.json(); setInviteLink(d.link); setWhatsappLink(d.whatsapp) }
              setGerando(false)
            }} className="px-4 py-2.5 rounded-lg font-semibold text-xs btn-gold disabled:opacity-50">
              Gerar Link
            </button>
          </div>
          {inviteLink && (
            <div className="flex gap-2">
              <button type="button" onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[var(--dark-border)] hover:border-[var(--gold)] transition-all">
                {copied ? "✅ Copiado!" : "📋 Copiar Link"}
              </button>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-lg text-xs font-semibold text-center bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-all">
                📲 WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
