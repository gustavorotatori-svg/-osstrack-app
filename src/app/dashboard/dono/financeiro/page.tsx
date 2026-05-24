"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import Link from "next/link"

export default function DonoFinanceiroPage() {
  const [relatorio, setRelatorio] = useState<any>(null)
  const [cobrancas, setCobrancas] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/financeiro/relatorios").then(r => r.json()).then(setRelatorio).catch(() => {})
    fetch("/api/financeiro/cobrancas").then(r => r.json()).then(setCobrancas).catch(() => {})
  }, [])

  const pendentes = cobrancas.filter(c => c.status === "pendente")
  const atrasados = cobrancas.filter(c => c.status === "pendente" && new Date(c.dataVencimento) < new Date())

  return (
    <DashboardShell role="dono">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-bold text-lg">Financeiro</h3>
          <p className="text-xs text-[var(--white-muted)]">Gestão financeira completa da academia</p>
        </div>

        {relatorio && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
              <div className="text-xl mb-1">📊</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]">{relatorio.totalAlunos}</div>
              <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Total Alunos</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">{relatorio.alunosAtivos} ativos</div>
            </div>
            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
              <div className="text-xl mb-1">📋</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]">{relatorio.totalContratos}</div>
              <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Contratos Ativos</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/5 to-black/20 border border-emerald-500/15 rounded-2xl p-4 text-center hover-card">
              <div className="text-xl mb-1">✅</div>
              <div className="text-lg font-extrabold text-emerald-500">R$ {relatorio.receitaRecebida.toFixed(2)}</div>
              <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Recebido no Mês</div>
              <div className="text-[10px] text-[var(--white-muted)] mt-0.5">{relatorio.pagamentosMes}/{relatorio.cobrancasMes} pagas</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/5 to-black/20 border border-red-500/15 rounded-2xl p-4 text-center hover-card">
              <div className="text-xl mb-1">⚠️</div>
              <div className="text-lg font-extrabold text-red-500">R$ {(relatorio.receitaEsperada - relatorio.receitaRecebida).toFixed(2)}</div>
              <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Em Aberto</div>
              <div className="text-[10px] text-red-400 mt-0.5">{relatorio.cobrancasAtrasadas} atrasadas</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/dono/financeiro/planos" className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
            <div className="text-2xl mb-2">🏷️</div>
            <div className="text-xs font-bold uppercase tracking-wide">Planos</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1">Gerenciar mensalidades</div>
          </Link>
          <Link href="/dashboard/dono/financeiro/cobrancas" className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
            <div className="text-2xl mb-2">💳</div>
            <div className="text-xs font-bold uppercase tracking-wide">Cobranças</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1">{pendentes.length} pendentes</div>
          </Link>
        </div>

        {atrasados.length > 0 && (
          <div className="bg-gradient-to-br from-red-500/5 to-black/20 border border-red-500/15 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-sm tracking-tight text-red-500">Cobranças Atrasadas</h3>
            </div>
            <div className="space-y-2">
              {atrasados.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold truncate block">{c.aluno?.nome}</span>
                    <span className="text-[10px] text-[var(--white-muted)]">{c.contrato?.plano?.nome}</span>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div>
                      <div className="text-xs font-bold text-red-500">R$ {c.valor.toFixed(2)}</div>
                      <div className="text-[9px] text-[var(--white-muted)]">Venceu {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <WhatsAppButton acao="cobranca" alunoId={c.alunoId} alunoNome={c.aluno?.nome} valor={c.valor} dataVencimento={c.dataVencimento} size="sm" variant="ghost" label="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
