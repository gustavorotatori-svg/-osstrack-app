"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

type Graduacao = {
  id: string
  faixa: string
  graus: number
  aulasPorGrau: number
  aulasProxFx: number | null
  aulasMinimasAno: number | null
  dataProva: string | null
  regraTroca: string
  categoria: string
}

const beltIcons: Record<string, string> = {
  Branca: "⬜", Azul: "🟦", Roxa: "🟪", Marrom: "🟫", Preta: "⬛",
}

const categorias = ["adulto", "infantil", "master"]
const regrasTroca = [
  { value: "graus", label: "Por graus (padrão)" },
  { value: "aulas", label: "Por total de aulas" },
  { value: "prova", label: "Por data de exame" },
]

export default function GraduacoesClient({ role }: { role: string }) {
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([])
  const [categoria, setCategoria] = useState("adulto")
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Graduacao | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCriar, setShowCriar] = useState(false)
  const [novo, setNovo] = useState({ faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: "", aulasMinimasAno: "", dataProva: "", regraTroca: "graus" })
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    fetch("/api/graduacoes").then(r => r.json()).then(setGraduacoes).catch(() => {})
  }, [])

  const filtered = graduacoes.filter(g => g.categoria === categoria)

  function startEdit(g: Graduacao) {
    setEditing(g.id)
    setEditForm({ ...g })
  }

  function cancelEdit() {
    setEditing(null)
    setEditForm(null)
  }

  async function saveEdit() {
    if (!editForm) return
    setSaving(true)
    const res = await fetch("/api/graduacoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setGraduacoes(prev => prev.map(g => g.id === updated.id ? updated : g))
      setEditing(null)
      setEditForm(null)
    }
    setSaving(false)
  }

  function updateField(field: string, value: any) {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null)
  }

  return (
    <DashboardShell role={role}>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-1">🥋 Regras de Graduação</h3>
          <p className="text-xs text-[var(--white-muted)] mb-4">Defina os critérios de evolução para cada faixa</p>

          <div className="flex gap-1 bg-[var(--dark-border)] rounded-lg p-1 mb-5">
            {categorias.map(c => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold capitalize transition-all ${categoria === c ? "bg-[var(--gold)] text-black" : "text-[var(--white-muted)] hover:text-white"}`}
              >{c}</button>
            ))}
          </div>

          <button onClick={() => setShowCriar(!showCriar)}
            className="w-full mb-4 py-2.5 rounded-xl text-xs font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all">
            {showCriar ? "− Cancelar" : "+ Criar Regra"}
          </button>

          {showCriar && (
            <div className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Faixa</label>
                  <select className="input-premium text-sm mt-1" value={novo.faixa} onChange={e => setNovo({ ...novo, faixa: e.target.value })}>
                    {Object.keys(beltIcons).map(f => <option key={f} value={f}>{beltIcons[f]} {f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Graus</label>
                  <input type="number" className="input-premium text-sm mt-1" value={novo.graus} onChange={e => setNovo({ ...novo, graus: Number(e.target.value) })} min={1} max={10} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas por Grau</label>
                  <input type="number" className="input-premium text-sm mt-1" value={novo.aulasPorGrau} onChange={e => setNovo({ ...novo, aulasPorGrau: Number(e.target.value) })} min={1} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas p/ próx. faixa</label>
                  <input type="number" className="input-premium text-sm mt-1" value={novo.aulasProxFx} onChange={e => setNovo({ ...novo, aulasProxFx: e.target.value })} placeholder="Automático" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas mín/ano</label>
                  <input type="number" className="input-premium text-sm mt-1" value={novo.aulasMinimasAno} onChange={e => setNovo({ ...novo, aulasMinimasAno: e.target.value })} placeholder="Opcional" />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Regra</label>
                  <select className="input-premium text-sm mt-1" value={novo.regraTroca} onChange={e => setNovo({ ...novo, regraTroca: e.target.value })}>
                    {regrasTroca.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Data do exame</label>
                <input type="date" className="input-premium text-sm mt-1" value={novo.dataProva} onChange={e => setNovo({ ...novo, dataProva: e.target.value })} />
              </div>
              <button onClick={async () => {
                setCriando(true)
                const res = await fetch("/api/graduacoes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...novo, categoria, aulasProxFx: novo.aulasProxFx ? Number(novo.aulasProxFx) : null, aulasMinimasAno: novo.aulasMinimasAno ? Number(novo.aulasMinimasAno) : null }),
                })
                if (res.ok) {
                  const created = await res.json()
                  setGraduacoes(prev => [...prev, created])
                  setShowCriar(false)
                  setNovo({ faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: "", aulasMinimasAno: "", dataProva: "", regraTroca: "graus" })
                }
                setCriando(false)
              }} disabled={criando}
                className="w-full py-2.5 rounded-xl text-xs font-bold btn-gold">{criando ? "Criando..." : "Criar Regra"}</button>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(g => (
              <div key={g.id} className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4 hover-card">
                {editing === g.id && editForm ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{beltIcons[g.faixa] || "🥋"}</span>
                      <h4 className="font-bold text-sm">{g.faixa}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Graus</label>
                        <input type="number" className="input-premium text-sm mt-1" value={editForm.graus}
                          onChange={e => updateField("graus", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas por Grau</label>
                        <input type="number" className="input-premium text-sm mt-1" value={editForm.aulasPorGrau}
                          onChange={e => updateField("aulasPorGrau", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas p/ próx. faixa</label>
                        <input type="number" className="input-premium text-sm mt-1" value={editForm.aulasProxFx ?? ""}
                          onChange={e => updateField("aulasProxFx", e.target.value ? Number(e.target.value) : null)} placeholder="Automático" />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Aulas mín/ano</label>
                        <input type="number" className="input-premium text-sm mt-1" value={editForm.aulasMinimasAno ?? ""}
                          onChange={e => updateField("aulasMinimasAno", e.target.value ? Number(e.target.value) : null)} placeholder="Opcional" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Regra de troca</label>
                      <select className="input-premium text-sm mt-1" value={editForm.regraTroca}
                        onChange={e => updateField("regraTroca", e.target.value)}>
                        {regrasTroca.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-[var(--gray)] uppercase tracking-wide font-semibold">Data do exame</label>
                      <input type="date" className="input-premium text-sm mt-1"
                        value={editForm.dataProva ? editForm.dataProva.split("T")[0] : ""}
                        onChange={e => updateField("dataProva", e.target.value || null)} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} disabled={saving}
                        className="btn-gold px-5 py-2 text-xs font-bold">{saving ? "Salvando..." : "Salvar"}</button>
                      <button onClick={cancelEdit}
                        className="px-5 py-2 rounded-xl text-xs font-bold border border-[var(--dark-border)] text-[var(--white-muted)] hover:text-white transition-all">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{beltIcons[g.faixa] || "🥋"}</span>
                        <h4 className="font-bold text-sm">{g.faixa}</h4>
                      </div>
                      {(role === "dono" || role === "professor") && (
                        <button onClick={() => startEdit(g)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all">✏️ Editar</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Graus</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.graus}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Aulas/Grau</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasPorGrau}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Próx. Faixa</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasProxFx ? `${g.aulasProxFx} aulas` : "—"}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Mín/Ano</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasMinimasAno ? `${g.aulasMinimasAno}` : "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] text-[var(--gold)]">
                        {regrasTroca.find(r => r.value === g.regraTroca)?.label || g.regraTroca}
                      </span>
                      {g.dataProva && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(139,26,26,0.1)] text-[var(--red)]">
                          Prova: {new Date(g.dataProva).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[var(--white-muted)] text-center py-6">Nenhuma regra cadastrada para esta categoria</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-3">📖 Legenda</h3>
          <div className="space-y-2 text-xs text-[var(--white-muted)]">
            <p><span className="text-[var(--gold)] font-semibold">Graus:</span> Quantidade de graus (stripes) na faixa atual</p>
            <p><span className="text-[var(--gold)] font-semibold">Aulas por Grau:</span> Check-ins necessários para cada grau</p>
            <p><span className="text-[var(--gold)] font-semibold">Próx. Faixa:</span> Total de aulas para mudar de faixa (em branco = automático = graus × aulasPorGrau)</p>
            <p><span className="text-[var(--gold)] font-semibold">Mín/Ano:</span> Mínimo de aulas no ano para ser elegível à próxima faixa</p>
            <p><span className="text-[var(--gold)] font-semibold">Regra:</span> "Por graus" = sobe ao completar graus | "Por aulas" = sobe ao atingir total de aulas | "Por exame" = sobe apenas na data do exame</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
