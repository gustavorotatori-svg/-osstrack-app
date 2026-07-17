"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { Avatar } from "@/components/ui/avatar"
import { Search, ChevronDown, X } from "lucide-react"
import { getBeltColor } from "@/lib/utils"

type AlunoData = {
  id: string
  nome: string
  email: string
  telefone: string | null
  faixa: string
  grau: number
  categoria: string
  pontos: number
  dataInicio: string | null
  ultimaPresenca: string | null
  avatar: string | null
}

const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const CATEGORIAS = ["adulto", "infantil", "iniciante", "master"]

export function AlunosClient() {
  const [alunos, setAlunos] = useState<AlunoData[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroFaixa, setFiltroFaixa] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [ordenarPor, setOrdenarPor] = useState<"nome" | "faixa" | "pontos" | "ultimaPresenca">("nome")
  const [ordemAsc, setOrdemAsc] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/dashboard/dono/alunos")
      .then((r) => r.json())
      .then((d) => {
        setAlunos(d.alunos || [])
      })
      .catch((e) => console.error("alunos", e))
      .finally(() => setLoading(false))
  }, [])

  function getUltimaPresenca(p: string | null) {
    if (!p) return "Nunca"
    const d = new Date(p)
    const hoje = new Date()
    const diff = Math.floor((hoje.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Hoje"
    if (diff === 1) return "Ontem"
    if (diff < 7) return `Há ${diff} dias`
    return d.toLocaleDateString("pt-BR")
  }

  const filtrados = alunos
    .filter((a) => {
      if (busca && !a.nome.toLowerCase().includes(busca.toLowerCase())) return false
      if (filtroFaixa && a.faixa !== filtroFaixa) return false
      if (filtroCategoria && a.categoria !== filtroCategoria) return false
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      if (ordenarPor === "nome") cmp = a.nome.localeCompare(b.nome)
      else if (ordenarPor === "faixa") cmp = FAIXAS.indexOf(a.faixa) - FAIXAS.indexOf(b.faixa)
      else if (ordenarPor === "pontos") cmp = a.pontos - b.pontos
      else if (ordenarPor === "ultimaPresenca") {
        if (!a.ultimaPresenca && !b.ultimaPresenca) cmp = 0
        else if (!a.ultimaPresenca) cmp = 1
        else if (!b.ultimaPresenca) cmp = -1
        else cmp = new Date(b.ultimaPresenca).getTime() - new Date(a.ultimaPresenca).getTime()
      }
      return ordemAsc ? cmp : -cmp
    })

  const toggleOrdem = (campo: typeof ordenarPor) => {
    if (ordenarPor === campo) setOrdemAsc(!ordemAsc)
    else { setOrdenarPor(campo); setOrdemAsc(true) }
  }

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">Alunos</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {filtrados.length} de {alunos.length} alunos
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-field w-full text-sm pl-9"
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5" aria-label="Limpar busca">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )}
            </div>

            <select
              value={filtroFaixa}
              onChange={(e) => setFiltroFaixa(e.target.value)}
              className="input-field text-sm w-[130px]"
            >
              <option value="">Todas faixas</option>
              {FAIXAS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="input-field text-sm w-[130px]"
            >
              <option value="">Todas categorias</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="surface p-4 animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-32 bg-white/5 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[var(--text-secondary)]">
                {busca || filtroFaixa || filtroCategoria ? "Nenhum aluno encontrado com esses filtros" : "Nenhum aluno cadastrado"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">
                <div className="col-span-4 cursor-pointer select-none flex items-center gap-1" onClick={() => toggleOrdem("nome")}>
                  Nome {ordenarPor === "nome" && (ordemAsc ? "▲" : "▼")}
                </div>
                <div className="col-span-2 cursor-pointer select-none flex items-center gap-1" onClick={() => toggleOrdem("faixa")}>
                  Faixa {ordenarPor === "faixa" && (ordemAsc ? "▲" : "▼")}
                </div>
                <div className="col-span-1 text-center">Grau</div>
                <div className="col-span-2">Telefone</div>
                <div className="col-span-2 cursor-pointer select-none flex items-center gap-1" onClick={() => toggleOrdem("ultimaPresenca")}>
                  Última Aula {ordenarPor === "ultimaPresenca" && (ordemAsc ? "▲" : "▼")}
                </div>
                <div className="col-span-1 text-right cursor-pointer select-none flex items-center gap-1 justify-end" onClick={() => toggleOrdem("pontos")}>
                  Pontos {ordenarPor === "pontos" && (ordemAsc ? "▲" : "▼")}
                </div>
              </div>

              {filtrados.map((a) => (
                <a
                  key={a.id}
                  href={`/dashboard/dono/perfil?id=${a.id}`}
                  className="surface px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors no-underline"
                >
                  <Avatar name={a.nome} faixa={a.faixa} size={36} />
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-2 items-center">
                    <div className="md:col-span-4">
                      <div className="text-sm font-semibold truncate">{a.nome}</div>
                      <div className="text-[10px] text-[var(--text-muted)] md:hidden">{a.faixa} · {a.categoria}</div>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBeltColor(a.faixa)}`}>
                        {a.faixa}
                      </span>
                    </div>
                    <div className="hidden md:block md:col-span-1 text-center">
                      <span className="text-xs text-[var(--text-secondary)]">{'★'.repeat(a.grau)}</span>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                      <span className="text-xs text-[var(--text-secondary)]">{a.telefone || "—"}</span>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                      <span className={`text-xs ${getUltimaPresenca(a.ultimaPresenca) === "Nunca" ? "text-red-400" : "text-[var(--text-secondary)]"}`}>
                        {getUltimaPresenca(a.ultimaPresenca)}
                      </span>
                    </div>
                    <div className="hidden md:flex md:col-span-1 items-center justify-end">
                      <span className="text-xs font-mono text-[var(--gold)]">{a.pontos}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)] -rotate-90 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}
