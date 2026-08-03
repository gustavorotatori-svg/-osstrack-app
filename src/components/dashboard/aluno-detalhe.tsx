"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { Avatar } from "@/components/ui/avatar"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { MessageCircle, Users } from "lucide-react"

type AlunoDetalheData = {
  id: string
  nome: string
  email: string
  telefone: string | null
  avatar: string | null
  faixa: string
  grau: number
  categoria: string
  dataInicio: string | null
  academia: string
  totalAulas: number
  totalPresencas: number
  thisMonth: number
  currentStreak: number
  bestStreak: number
  familia: {
    id: string
    nome: string
    desconto: number
    membros: { id: string; nome: string; faixa: string }[]
  } | null
  ultimosCheckins: { data: string; horario: string; status: string }[]
}

export function AlunoDetalheClient({ aluno, role }: { aluno: AlunoDetalheData; role: "dono" | "professor" }) {
  const prefix = role === "dono" ? "dono" : "professor"

  function formatarData(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  function abrirWhatsApp() {
    if (!aluno.telefone) return
    const num = aluno.telefone.replace(/\D/g, "")
    const msg = `Olá ${aluno.nome}, tudo bem? Aqui é da academia! 🥋`
    window.open(`https://wa.me/55${num}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <DashboardShell role={role}>
      <PageTransition>
        <div className="max-w-lg mx-auto space-y-5">
          <div className="glass-card p-6 text-center">
            <div className="mx-auto w-fit">
              <Avatar name={aluno.nome} faixa={aluno.faixa} size={88} src={aluno.avatar} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-4">{aluno.nome}</h2>
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2 ${getBeltColor(aluno.faixa)}`}>
              {getBeltEmoji(aluno.faixa)} {aluno.faixa} · {aluno.grau + 1}º Grau
            </span>
            <div className="mt-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {aluno.categoria}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">{aluno.academia}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{aluno.email}</p>
            {aluno.dataInicio && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">🥋 Desde {formatarData(aluno.dataInicio)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="stat-glass">
              <div className="stat-glass-value"><span>{aluno.totalAulas}</span></div>
              <div className="stat-glass-label">Aulas</div>
            </div>
            <div className="stat-glass">
              <div className="stat-glass-value"><span>{aluno.totalPresencas}</span></div>
              <div className="stat-glass-label">Presenças</div>
            </div>
            <div className="stat-glass">
              <div className="stat-glass-value"><span>{aluno.thisMonth}</span></div>
              <div className="stat-glass-label">Este mês</div>
            </div>
            <div className="stat-glass">
              <div className="stat-glass-value"><span>{aluno.currentStreak}</span></div>
              <div className="stat-glass-label">Streak</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="section-header">🔥 Streak</div>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-lg font-bold" style={{ color: "var(--gold)" }}>{aluno.currentStreak}</div>
                <div className="text-[10px] text-[var(--text-muted)]">atual</div>
              </div>
              <div className="h-10 w-px" style={{ background: "var(--border)" }} />
              <div className="text-center flex-1">
                <div className="text-lg font-bold" style={{ color: "var(--gold)" }}>{aluno.bestStreak}</div>
                <div className="text-[10px] text-[var(--text-muted)]">melhor</div>
              </div>
            </div>
          </div>

          {aluno.familia && (
            <div className="glass-card p-5">
              <h3 className="font-bold text-sm section-header mb-3">
                <Users className="w-4 h-4 inline -mt-0.5 mr-1" />{aluno.familia.nome}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Desconto familiar de <span className="text-[var(--gold)] font-bold">{aluno.familia.desconto}%</span>
              </p>
              <div className="space-y-1.5">
                {aluno.familia.membros
                  .filter((m) => m.id !== aluno.id)
                  .map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--dark-card)]">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(m.faixa)}`}>
                        {m.faixa}
                      </span>
                      <span className="text-sm">{m.nome}</span>
                    </div>
                  ))}
                {aluno.familia.membros.filter((m) => m.id !== aluno.id).length === 0 && (
                  <p className="text-xs text-[var(--text-muted)]">Único membro desta família</p>
                )}
              </div>
            </div>
          )}

          <div className="glass-card p-5">
            <div className="section-header">Últimos check-ins</div>
            {aluno.ultimosCheckins.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-3">Nenhum check-in registrado</p>
            ) : (
              <div className="space-y-1.5">
                {aluno.ultimosCheckins.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--dark-card)]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${c.status === "confirmed" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                      <span className="text-sm">{formatarData(c.data)}</span>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">{c.horario || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {aluno.telefone && (
            <button onClick={abrirWhatsApp}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-green-600/15 text-green-400 hover:bg-green-600/25 transition-all active:scale-[0.97] min-h-[44px]">
              <MessageCircle className="w-4 h-4 inline mr-2" />Chamar no WhatsApp
            </button>
          )}

          <a href={`/dashboard/${prefix}/alunos`}
            className="block w-full text-center py-3.5 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all min-h-[44px]">
            Voltar para alunos
          </a>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}
