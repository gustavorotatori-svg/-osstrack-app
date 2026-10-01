"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { useEscape } from "@/lib/use-escape"
import { PageTransition } from "@/components/ui/page-transition"

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
  const t = useT("dono.graduacoes")
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([])
  const [categoria, setCategoria] = useState("adulto")
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Graduacao | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCriar, setShowCriar] = useState(false)
  const [novo, setNovo] = useState({ faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: "", aulasMinimasAno: "", dataProva: "", regraTroca: "graus" })
  const [criando, setCriando] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [copying, setCopying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEscape(() => setShowShare(false), showShare)

  useEffect(() => {
    ;(async () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("osstrack_academiaId")
        if (stored) {
          const base = window.location.origin
          setShareLink(`${base}/compartilhar/regras/${stored}`)
        }
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      fetch("/api/graduacoes")
        .then(r => { if (!r.ok) throw new Error("Erro ao carregar"); return r.json() })
        .then((d) => { setGraduacoes(d); setLoading(false) })
        .catch(() => { toast.error(t("erroCarregar")); setError(t("erroCarregar")); setLoading(false) })
    })()
  }, [t])

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
      toast.success(t("regraAtualizada"))
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || t("erroSalvar"))
    }
    setSaving(false)
  }

  function updateField(field: string, value: number | string | null) {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null)
  }

  return (
    <DashboardShell role={role}>
      <PageTransition><div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center py-4">
          {loading ? (
            <div className="glass-card p-6 space-y-4">
              <div className="h-5 bg-[var(--border)] rounded animate-pulse w-1/3 mx-auto" />
              <div className="h-3 bg-[var(--border)] rounded animate-pulse w-2/3 mx-auto" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-[var(--border)] rounded-xl animate-pulse" />
                <div className="h-24 bg-[var(--border)] rounded-xl animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-[var(--border)] rounded-xl animate-pulse" />
                <div className="h-16 bg-[var(--border)] rounded-xl animate-pulse" />
                <div className="h-16 bg-[var(--border)] rounded-xl animate-pulse" />
                <div className="h-16 bg-[var(--border)] rounded-xl animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="glass-card text-center py-12">
              <p className="text-sm text-[var(--text-secondary)]">{error}</p>
<button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-xl text-xs font-bold btn-gold">
                 {t("tentarNovamente")}
               </button>
            </div>
          ) : (
          <>
<h3 className="font-bold text-lg mb-1">🥋 {t("title")}</h3>
           <p className="text-xs text-[var(--text-secondary)] mb-4">{t("subtitle")}</p>

          <div className="flex gap-1 bg-[var(--border)] rounded-lg p-1 mb-5">
            {categorias.map(c => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold capitalize transition-all ${categoria === c ? "bg-[var(--gold)] text-black" : "text-[var(--text-secondary)] hover:text-white"}`}
              >{c}</button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setShowCriar(!showCriar)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all">
              {showCriar ? `− ${t("cancelar")}` : `+ ${t("criarRegra")}`}
            </button>
            <button onClick={() => setShowShare(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[rgba(201,168,76,0.08)] text-[var(--gold)] border border-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.15)] transition-all">
              📋 {t("compartilhar")}
            </button>
          </div>

          {/* Share modal */}
          {showShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div className="relative glass-card max-w-sm w-full p-6" role="dialog" aria-modal="true" aria-label={t("compartilharTitle")} onClick={e => e.stopPropagation()}>
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">📋</div>
                  <h4 className="font-bold text-sm">{t("compartilharTitle")}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                    {t("compartilharDesc")}
                  </p>
                </div>

                <div className="bg-black/40 border border-[var(--border)] rounded-xl p-3 mb-4">
                  <div className="text-[10px] text-[var(--text-muted)] mb-1">{t("linkCompartilhavel")}</div>
                  <div className="text-xs text-[var(--text-secondary)] break-all font-mono bg-black/40 rounded-lg px-3 py-2 border border-[var(--border)]">
                    {shareLink || t("carregando")}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        if (!shareLink) return
                        setCopying(true)
                        try {
                          await navigator.clipboard.writeText(shareLink)
toast.success(t("linkCopiado"))
                         } catch {
                           toast.error(t("erroCopiar"))
                        }
                        setCopying(false)
                      }}
                      disabled={copying}
                      className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all"
                    >
                      {copying ? t("copiando") : `📋 ${t("copiarLink")}`}
                    </button>
                    {shareLink && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🥋 ${t("compartilharWhatsMsg").replace("{link}", shareLink)}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-center"
                      >
                        📲 {t("whatsapp")}
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowShare(false)}
                  className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] text-[var(--text-secondary)] hover:text-white transition-all"
                >
                  {t("fechar")}
                </button>
              </div>
            </div>
          )}

          {showCriar && (
            <div className="bg-black/40 border border-[var(--border)] rounded-2xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("faixa")}</label>
                  <select className="input-field text-sm mt-1" value={novo.faixa} onChange={e => setNovo({ ...novo, faixa: e.target.value })}>
                    {Object.keys(beltIcons).map(f => <option key={f} value={f}>{beltIcons[f]} {f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("graus")}</label>
                  <input type="number" className="input-field text-sm mt-1" value={novo.graus} onChange={e => setNovo({ ...novo, graus: Number(e.target.value) })} min={1} max={10} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasPorGrau")}</label>
                  <input type="number" className="input-field text-sm mt-1" value={novo.aulasPorGrau} onChange={e => setNovo({ ...novo, aulasPorGrau: Number(e.target.value) })} min={1} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasProxFaixa")}</label>
                  <input type="number" className="input-field text-sm mt-1" value={novo.aulasProxFx} onChange={e => setNovo({ ...novo, aulasProxFx: e.target.value })} placeholder={t("automatico")} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasMinAno")}</label>
                  <input type="number" className="input-field text-sm mt-1" value={novo.aulasMinimasAno} onChange={e => setNovo({ ...novo, aulasMinimasAno: e.target.value })} placeholder={t("opcional")} />
                </div>
                <div>
                  <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("regra")}</label>
                  <select className="input-field text-sm mt-1" value={novo.regraTroca} onChange={e => setNovo({ ...novo, regraTroca: e.target.value })}>
                    {regrasTroca.map((r, i) => <option key={r.value} value={r.value}>{t(`regrasTroca.${i}.label`)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("dataExame")}</label>
                <input type="date" className="input-field text-sm mt-1" value={novo.dataProva} onChange={e => setNovo({ ...novo, dataProva: e.target.value })} />
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
toast.success(t("regraCriada"))
                 } else {
                   const err = await res.json().catch(() => ({}))
                   toast.error(err.error || t("erroCriar"))
                }
                setCriando(false)
              }} disabled={criando}
                className="w-full py-2.5 rounded-xl text-xs font-bold btn-gold">{criando ? t("criando") : t("criarRegra")}</button>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(g => (
              <div key={g.id} className="glass-card p-4">
                {editing === g.id && editForm ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{beltIcons[g.faixa] || "🥋"}</span>
                      <h4 className="font-bold text-sm">{g.faixa}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("graus")}</label>
                        <input type="number" className="input-field text-sm mt-1" value={editForm.graus}
                          onChange={e => updateField("graus", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasPorGrau")}</label>
                        <input type="number" className="input-field text-sm mt-1" value={editForm.aulasPorGrau}
                          onChange={e => updateField("aulasPorGrau", Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasProxFaixa")}</label>
                        <input type="number" className="input-field text-sm mt-1" value={editForm.aulasProxFx ?? ""}
                          onChange={e => updateField("aulasProxFx", e.target.value ? Number(e.target.value) : null)} placeholder={t("automatico")} />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("aulasMinAno")}</label>
                        <input type="number" className="input-field text-sm mt-1" value={editForm.aulasMinimasAno ?? ""}
                          onChange={e => updateField("aulasMinimasAno", e.target.value ? Number(e.target.value) : null)} placeholder={t("opcional")} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("regraTrocaLabel")}</label>
                      <select className="input-field text-sm mt-1" value={editForm.regraTroca}
                        onChange={e => updateField("regraTroca", e.target.value)}>
{regrasTroca.map((r, i) => <option key={r.value} value={r.value}>{t(`regrasTroca.${i}.label`)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{t("dataExame")}</label>
                      <input type="date" className="input-field text-sm mt-1"
                        value={editForm.dataProva ? editForm.dataProva.split("T")[0] : ""}
                        onChange={e => updateField("dataProva", e.target.value || null)} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} disabled={saving}
                        className="btn-gold px-5 py-2 text-xs font-bold">{saving ? t("salvando") : t("salvar")}</button>
                      <button onClick={cancelEdit}
                        className="px-5 py-2 rounded-xl text-xs font-bold border border-[var(--border)] text-[var(--text-secondary)] hover:text-white transition-all">{t("cancelar")}</button>
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
                        <div className="flex gap-1.5">
                          <button onClick={() => startEdit(g)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.2)] hover:bg-[rgba(201,168,76,0.2)] transition-all">✏️ {t("editar")}</button>
                          <button aria-label={t("excluirAria").replace("{faixa}", g.faixa)} onClick={async () => {
                            if (!confirm(t("confirmarExcluir").replace("{faixa}", g.faixa))) return
                            const r = await fetch("/api/graduacoes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: g.id }) })
                            if (r.ok) {
                              setGraduacoes(prev => prev.filter(x => x.id !== g.id))
                              toast.success(t("regraExcluida"))
                            } else {
                              const err = await r.json().catch(() => ({}))
                              toast.error(err.error || t("erroExcluir"))
                            }
                          }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-800/30 hover:bg-red-800/40 transition-all">🗑️</button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--text-muted)] uppercase">{t("labelGraus")}</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.graus}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--text-muted)] uppercase">{t("labelAulasGrau")}</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasPorGrau}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--text-muted)] uppercase">{t("proxFaixa")}</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasProxFx ? `${g.aulasProxFx} ${t("aulas")}` : "—"}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 text-center">
                        <div className="text-[9px] text-[var(--text-muted)] uppercase">{t("minAno")}</div>
                        <div className="text-xs font-bold text-[var(--gold)]">{g.aulasMinimasAno ? `${g.aulasMinimasAno}` : "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] text-[var(--gold)]">
                        {(() => { const idx = regrasTroca.findIndex(r => r.value === g.regraTroca); return idx >= 0 ? t(`regrasTroca.${idx}.label`) : g.regraTroca })()}
                      </span>
                      {g.dataProva && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(139,26,26,0.1)] text-[var(--red)]">
                          {t("provaData").replace("{data}", new Date(g.dataProva).toLocaleDateString("pt-BR"))}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] text-center py-6">{t("nenhumaRegra")}</p>
            )}
          </div>
        </>
        )}
        </div>

        {!loading && !error && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-bold text-sm mb-3">📖 {t("legenda")}</h3>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p><span className="text-[var(--gold)] font-semibold">{t("labelGraus")}:</span> {t("legendaGraus")}</p>
              <p><span className="text-[var(--gold)] font-semibold">{t("aulasPorGrau")}:</span> {t("legendaAulasPorGrau")}</p>
              <p><span className="text-[var(--gold)] font-semibold">{t("proxFaixa")}:</span> {t("legendaProxFaixa")}</p>
              <p><span className="text-[var(--gold)] font-semibold">{t("minAno")}:</span> {t("legendaMinAno")}</p>
              <p><span className="text-[var(--gold)] font-semibold">{t("regra")}:</span> {t("legendaRegra")}</p>
            </div>
          </div>
        )}
      </div></PageTransition>
    </DashboardShell>
  )
}
