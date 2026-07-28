"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BackButton } from "@/components/ui/back-button"
import Link from "next/link"

interface AlunoRisco {
  id: string; nome: string; faixa: string; avatar: string | null
  diasSemTreinar: number; risco: "critico" | "alto" | "medio"; motivo: string; ultimoCheckin: string | null
}
interface ChurnData { alunosEmRisco: AlunoRisco[]; totalAlunos: number; ativos30d: number; taxaRetencao: number }

const riscoCores = {
  critico: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", label: "CRÍTICO" },
  alto: { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", text: "#f97316", label: "ALTO" },
  medio: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", label: "MÉDIO" },
}

export default function ProfessorChurnPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ChurnData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session && session.user.role === "aluno") router.push("/dashboard/aluno")
  }, [session, status, router])

  useEffect(() => {
    if (!session) return
    fetch("/api/dashboard/churn").then((r) => r.json()).then((d) => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [session])

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><div className="belt-loading w-48 h-8 rounded" /></div>
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-5 py-8">
        <BackButton href="/dashboard/professor" />
        <h1 className="text-2xl font-black tracking-tight gradient-gold-text mb-2">Alerta de Evasão</h1>
        <p className="text-xs mb-8" style={{ color: "var(--text-muted)" }}>Alunos que estão diminuindo a frequência</p>

        {data && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="glass-card p-4 text-center"><div className="text-2xl font-black gradient-gold-text">{data.totalAlunos}</div><div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Total</div></div>
              <div className="glass-card p-4 text-center"><div className="text-2xl font-black" style={{ color: "var(--green)" }}>{data.ativos30d}</div><div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Ativos (30d)</div></div>
              <div className="glass-card p-4 text-center"><div className="text-2xl font-black gradient-gold-text">{data.taxaRetencao}%</div><div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>Retenção</div></div>
            </div>

            {data.alunosEmRisco.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-4">🎉</div><h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Todos ativos!</h2></div>
            ) : (
              <div className="space-y-3">
                {data.alunosEmRisco.map((aluno) => {
                  const risco = riscoCores[aluno.risco]
                  return (
                    <div key={aluno.id} className="glass-card p-4 flex items-center gap-4" style={{ borderColor: risco.border }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: risco.bg, color: risco.text, border: `1px solid ${risco.border}` }}>{aluno.nome.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{aluno.nome}</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: risco.bg, color: risco.text }}>{risco.label}</span></div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{aluno.faixa} • {aluno.motivo}</div>
                      </div>
                      <Link href={`https://wa.me/?text=${encodeURIComponent(`Fala ${aluno.nome.split(" ")[0]}! Sentimos sua falta no tatame. 🥋`)}`} target="_blank" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[rgba(34,197,94,0.1)] text-[var(--green)] border border-[rgba(34,197,94,0.3)] hover:bg-[var(--green)] hover:text-white transition-all shrink-0">WhatsApp</Link>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
