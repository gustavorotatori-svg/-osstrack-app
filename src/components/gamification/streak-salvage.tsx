"use client"

import { useState } from "react"
import { FlameIcon, SparklesIcon } from "@/components/ui/icons"
import { toast } from "sonner"

export function StreakSalvage({ currentStreak, pontos }: { currentStreak: number; pontos: number }) {
  const [saving, setSaving] = useState(false)
  const [restored, setRestored] = useState(false)

  if (currentStreak >= 3 || restored) return null

  const custoXp = 100

  async function handleSalvar() {
    if (pontos < custoXp) {
      toast.error(`Você precisa de ${custoXp} XP para restaurar o streak`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/streak/salvar", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro")
      }
      setRestored(true)
      toast.success("Streak restaurado para 3 dias! 🔥")
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: any) {
      toast.error(e.message || "Erro ao restaurar streak")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl p-4 border border-orange-500/20" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <FlameIcon className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm">Streak perdido!</h4>
            <SparklesIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Seu streak foi resetado. Restaure para 3 dias gastando <strong className="text-[var(--gold)]">{custoXp} XP</strong>.
          </p>
          <button
            onClick={handleSalvar}
            disabled={saving || pontos < custoXp}
            className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "Restaurando..." : `Restaurar Streak (${custoXp} XP)`}
          </button>
          {pontos < custoXp && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Faltam {custoXp - pontos} XP — faça check-ins para ganhar XP!</p>
          )}
        </div>
      </div>
    </div>
  )
}