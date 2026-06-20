"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Search, MapPin } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useT } from "@/lib/use-t"
import { toast } from "sonner"
import { PageTransition } from "@/components/ui/page-transition"

export function ProfessorSemAcademia({ nome, faixa }: { nome: string; faixa: string }) {
  const router = useRouter()
  const t = useT("professor.dashboard")
  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<{ id: string; nome: string; cidade: string }[]>([])
  const [buscando, setBuscando] = useState(false)

  async function buscar(q: string) {
    setBusca(q)
    if (q.length < 2) { setResultados([]); return }
    setBuscando(true)
    try {
      const res = await fetch(`/api/academias?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResultados(data)
    } catch { toast.error("Erro ao buscar academias"); setResultados([]) }
    setBuscando(false)
  }

  async function solicitarVinculo(academiaId: string) {
    await fetch("/api/professores/solicitar-vinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academiaId }),
    })
    router.refresh()
  }

  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="max-w-2xl mx-auto mt-12 px-6 text-center">
          <div className="hero">
            <div className="relative z-10">
              <div className="label text-[var(--gold)] mb-2">PROFESSOR</div>
              <h1 className="hero-title">{t("titulo")}</h1>
              <p className="hero-sub">{nome} · {faixa}</p>
            </div>
          </div>

          <div className="card p-8 mt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-[var(--gold)]" />
            </div>
            <h2 className="h3 mb-2">Você ainda não está vinculado a uma academia</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Encontre sua academia para começar a usar o OssTrack
            </p>

            <div className="relative mb-4">
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar academia..."
                value={busca}
                onChange={(e) => buscar(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--text-muted)]" />
              {buscando && <span className="absolute right-3 top-3 text-xs text-[var(--gold)]">Buscando...</span>}
            </div>

            {resultados.length > 0 && (
              <div className="glass-card overflow-hidden text-left mb-4">
                {resultados.map((acad) => (
                  <div key={acad.id} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
                    <div>
                      <div className="text-sm font-medium">{acad.nome}</div>
                      {acad.cidade && <div className="text-xs text-[var(--text-secondary)]">{acad.cidade}</div>}
                    </div>
                    <button
                      onClick={() => solicitarVinculo(acad.id)}
                      className="btn btn-primary text-xs py-2 px-4 min-h-0"
                    >
                      Solicitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {busca.length >= 2 && resultados.length === 0 && !buscando && (
              <p className="text-xs text-[var(--text-secondary)]">
                Nenhuma academia encontrada. Tente outro termo.
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}
