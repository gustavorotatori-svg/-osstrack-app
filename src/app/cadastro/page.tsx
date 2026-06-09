"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"

export default function Cadastro() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    role: "aluno",
    academiaNome: "",
    academiaEndereco: "",
    academiaCidade: "",
    academiaRaio: 200,
    academiaModalidades: [] as string[],
    academiaId: "",
    professorId: "",
    codigoConvite: "",
    faixa: "Branca",
    grau: 0,
  })

  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<{ id: string; nome: string; cidade: string; estado: string }[]>([])
  const [buscando, setBuscando] = useState(false)
  const [skipAcademia, setSkipAcademia] = useState(false)
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([])
  const [buscaProf, setBuscaProf] = useState("")

  useEffect(() => {
    const convite = searchParams.get("convite")
    const tipo = searchParams.get("tipo")
    const academiaId = searchParams.get("academiaId")
    const academiaNome = searchParams.get("academia")
    const professorId = searchParams.get("professorId")
    if (convite) setForm((f) => ({ ...f, codigoConvite: convite, role: tipo || f.role, academiaId: academiaId || f.academiaId }))
    if (academiaNome) setForm((f) => ({ ...f, academiaNome }))
    if (professorId) setForm((f) => ({ ...f, professorId }))
  }, [searchParams])

  const t = useT("cadastro")

  function update(key: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleModalidade(mod: string) {
    setForm((prev) => ({
      ...prev,
      academiaModalidades: prev.academiaModalidades.includes(mod)
        ? prev.academiaModalidades.filter((m) => m !== mod)
        : [...prev.academiaModalidades, mod],
    }))
  }

  async function buscarAcademias(q: string) {
    setBusca(q)
    if (q.length < 2) { setResultados([]); return }
    setBuscando(true)
    try {
      const res = await fetch(`/api/academias?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResultados(data)
    } catch { setResultados([]) }
    setBuscando(false)
  }

  async function selecionarAcademia(acad: { id: string; nome: string }) {
    setForm((f) => ({ ...f, academiaId: acad.id, academiaNome: acad.nome }))
    setResultados([])
    setBusca("")
    if (form.role === "aluno") {
      const res = await fetch(`/api/professores?academiaId=${acad.id}`)
      if (res.ok) {
        const data = await res.json()
        setProfessores(data)
      }
    }
  }

  function avancarStep() {
    setStep((s) => s + 1)
    setError("")
  }

  function voltarStep() {
    setStep((s) => Math.max(1, s - 1))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (step < totalSteps) {
      if (step === 1) { avancarStep(); setLoading(false); return }
      if (step === 2 && form.role === "dono") {
        if (!form.academiaNome) { setError("Informe o nome da academia"); setLoading(false); return }
        avancarStep(); setLoading(false); return
      }
      if (step === 2 && form.role === "professor" && !form.academiaId && !form.codigoConvite) {
        avancarStep(); setLoading(false); return
      }
      if (step === 2 && form.role === "aluno") {
        if (!form.academiaId) {
          setSkipAcademia(true)
          setStep(5); setLoading(false); return
        }
        avancarStep(); setLoading(false); return
      }
      setLoading(false); return
    }

    try {
      const body: Record<string, unknown> = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
        role: form.role,
        codigoConvite: form.codigoConvite || undefined,
      }

      if (form.professorId) {
        body.professorId = form.professorId
      }

      if (form.role === "dono") {
        body.academia = {
          nome: form.academiaNome,
          endereco: form.academiaEndereco,
          cidade: form.academiaCidade,
          raio: form.academiaRaio,
          modalidades: form.academiaModalidades,
        }
      } else {
        body.academiaId = form.academiaId || undefined
        body.professorId = body.professorId || form.professorId || undefined
        body.faixa = form.faixa
        body.grau = form.grau
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) { setError(data.error || t("errors.criacao")); setLoading(false); return }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.senha,
        redirect: false,
      })

      if (result?.error) { router.push("/login"); return }

      if (form.role === "aluno") {
        router.push("/dashboard/aluno")
        return
      }

      router.push(data.redirect || "/dashboard/aluno")
    } catch {
      setError(t("errors.conexao"))
      setLoading(false)
    }
  }

  const modalidades = ["Jiu-Jitsu", "Karatê", "Judô", "Muay Thai", "Boxe", "Capoeira", "Taekwondo", "Kung Fu", "MMA", "Outra"]
  const faixas = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.nomeLabel")}</label>
            <input type="text" className="input" placeholder={t("step1.nomePlaceholder")} required value={form.nome} onChange={(e) => update("nome", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.emailLabel")}</label>
            <input type="email" className="input" placeholder={t("step1.emailPlaceholder")} required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.telefoneLabel")}</label>
            <input type="tel" className="input" placeholder={t("step1.telefonePlaceholder")} required value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.senhaLabel")}</label>
            <input type="password" className="input" placeholder={t("step1.senhaPlaceholder")} required minLength={6} value={form.senha} onChange={(e) => update("senha", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.tipoContaLabel")}</label>
            <select className="input" value={form.role} onChange={(e) => { update("role", e.target.value); setStep(1) }}>
              <option value="dono">{t("step1.donoOption")}</option>
              <option value="professor">{t("step1.professorOption")}</option>
              <option value="aluno">{t("step1.alunoOption")}</option>
            </select>
          </div>
        </>
      )
    }

    if (step === 2 && form.role === "dono") {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.nomeAcademiaLabel")}</label>
            <input type="text" className="input" placeholder={t("step2Dono.nomeAcademiaPlaceholder")} required value={form.academiaNome} onChange={(e) => update("academiaNome", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.enderecoLabel")}</label>
            <input type="text" className="input" placeholder={t("step2Dono.enderecoPlaceholder")} value={form.academiaEndereco} onChange={(e) => update("academiaEndereco", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.cidadeLabel")}</label>
            <input type="text" className="input" placeholder={t("step2Dono.cidadePlaceholder")} value={form.academiaCidade} onChange={(e) => update("academiaCidade", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.modalidadesLabel")}</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {modalidades.map((mod) => (
                <label key={mod} className="flex items-center gap-2 surface px-3 py-2 text-xs cursor-pointer hover:opacity-80 transition-all">
                  <input type="checkbox" className="accent-[var(--gold)]" checked={form.academiaModalidades.includes(mod)} onChange={() => toggleModalidade(mod)} />
                  {mod}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.raioLabel")}</label>
            <input type="number" className="input" placeholder={t("step2Dono.raioPlaceholder")} value={form.academiaRaio} onChange={(e) => update("academiaRaio", Number(e.target.value))} />
          </div>
          {form.professorId && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-emerald-400 font-semibold">{t("step2Dono.convidadoProfessor")}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{t("step2Dono.convidadoProfessorDesc")}</p>
            </div>
          )}
        </>
      )
    }

    if (step === 2 && form.role === "professor") {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">{t("step2Professor.info")}</p>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Professor.faixaLabel")}</label>
            <select className="input" value={form.faixa} onChange={(e) => update("faixa", e.target.value)}>
              {faixas.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Professor.grauLabel")}</label>
            <select className="input" value={form.grau} onChange={(e) => update("grau", Number(e.target.value))}>
              {[0, 1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{t("grauOption").replace("{g}", String(g))}</option>)}
            </select>
          </div>
        </div>
      )
    }

    if ((step === 3 && form.role === "professor") || (step === 2 && form.role === "aluno")) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            {form.role === "professor" ? t("step2Professor.buscaInfo") : t("step2Aluno.buscaInfo")}
          </p>
          <div className="relative">
            <input
              type="text"
              className="input"
              placeholder={t("step2Aluno.placeholder")}
              value={busca}
              onChange={(e) => buscarAcademias(e.target.value)}
            />
            {buscando && <span className="absolute right-3 top-3 text-xs" style={{ color: "var(--gold)" }}>{t("step2Aluno.buscando")}</span>}
          </div>
          {resultados.length > 0 && (
            <div className="surface overflow-hidden">
              {resultados.map((acad) => (
                <button
                  key={acad.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b border-[var(--border)] last:border-0"
                  onClick={() => selecionarAcademia(acad)}
                >
                  <span className="text-sm font-medium">{acad.nome}</span>
                  {acad.cidade && <span className="text-xs text-[var(--text-secondary)] ml-2">{acad.cidade}/{acad.estado}</span>}
                </button>
              ))}
            </div>
          )}
          {form.academiaId && (
            <div className="bg-[var(--gold-dim)] border border-[var(--gold)]/30 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{t("step2Aluno.academiaSelecionada")}</p>
              <p className="text-sm font-medium">{form.academiaNome}</p>
            </div>
          )}
          {form.role === "professor" && (
            <p className="text-xs text-[var(--text-secondary)] text-center pt-2">
              {t("step2Professor.naoEncontrou")}
            </p>
          )}
          {form.role === "aluno" && !form.academiaId && (
            <p className="text-xs text-[var(--text-secondary)] text-center pt-2">
              <button type="button" onClick={() => { setSkipAcademia(true); setStep(5) }} className="text-[var(--gold)] font-semibold hover:underline">
                {t("step2Aluno.naoEncontrou")}
              </button>
            </p>
          )}
        </div>
      )
    }

    if (form.role === "aluno" && step === 3) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">{t("step3Aluno.info")}</p>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step3Aluno.faixaLabel")}</label>
            <select className="input" value={form.faixa} onChange={(e) => { update("faixa", e.target.value); update("grau", 0) }}>
              {faixas.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step3Aluno.grauLabel")}</label>
            <select className="input" value={form.grau} onChange={(e) => update("grau", Number(e.target.value))}>
              {[0, 1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{t("step3Aluno.grauOption").replace("{g}", String(g))}</option>)}
            </select>
          </div>
        </div>
      )
    }

    if (form.role === "aluno" && step === 4) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">{t("step4Aluno.info")}</p>
          <div className="relative">
            <input
              type="text"
              className="input"
              placeholder={t("step4Aluno.placeholder")}
              value={buscaProf}
              onChange={(e) => {
                setBuscaProf(e.target.value)
                if (e.target.value.length < 2) { setProfessores([]); return }
                fetch(`/api/professores?q=${encodeURIComponent(e.target.value)}&academiaId=${form.academiaId}`)
                  .then(r => r.json())
                  .then(setProfessores)
                  .catch(() => setProfessores([]))
              }}
            />
            <span className="absolute right-3 top-3 text-xs" style={{ color: "var(--gold)" }}>{t("step4Aluno.buscar")}</span>
          </div>
          {professores.length > 0 && (
            <div className="surface overflow-hidden">
              {professores.map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b border-[var(--border)] last:border-0"
                  onClick={() => { update("professorId", prof.id); setProfessores([]); setBuscaProf(prof.nome) }}
                >
                  {prof.nome}
                </button>
              ))}
            </div>
          )}
          {form.professorId && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-400 font-semibold">{t("step4Aluno.professorSelecionado")}</p>
              <p className="text-sm font-medium">{buscaProf}</p>
            </div>
          )}
          <p className="text-xs text-[var(--text-secondary)] text-center pt-2">{t("step4Aluno.pular")}</p>
        </div>
      )
    }

    if (form.role === "aluno" && step === 5) {
      return (
        <div className="space-y-4 text-center">
          <div className="text-5xl mb-4">💳</div>
          <h3 className="text-xl font-extrabold">{t("step5Aluno.title")}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t("step5Aluno.price")}</p>
          <ul className="text-left space-y-2 text-sm text-[var(--text-secondary)] surface p-4">
            <li className="flex items-center gap-2">✅ {t("step5Aluno.feature1")}</li>
            <li className="flex items-center gap-2">✅ {t("step5Aluno.feature2")}</li>
            <li className="flex items-center gap-2">✅ {t("step5Aluno.feature3")}</li>
            <li className="flex items-center gap-2">✅ {t("step5Aluno.feature4")}</li>
            <li className="flex items-center gap-2">✅ {t("step5Aluno.feature5")}</li>
          </ul>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-400">
            {t("step5Aluno.warning")}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{t("step5Aluno.seguranca")}</p>
        </div>
      )
    }

    return null
  }

  const totalSteps = form.role === "dono" ? 2 : form.role === "professor" ? (form.academiaId || form.codigoConvite ? 2 : 3) : 5

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg"
            style={{ background: "var(--gold)", color: "#000" }}>
            🥋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>
            {form.role === "aluno" ? (
              <>{t("subtitleAluno")}</>
            ) : (
              <>{t("subtitleOther")}</>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface p-7 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="text-xs text-red-400 bg-[var(--red-dim)] border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button type="button" onClick={voltarStep} className="btn btn-ghost flex-1 py-3.5 text-sm">
                {t("buttons.voltar")}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`btn flex-1 py-3.5 text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={loading ? { background: "var(--border)", color: "var(--text-muted)" } : { background: "var(--gold)", color: "#000", fontWeight: 700 }}
            >
              {loading ? t("buttons.criandoConta") : step === 1 && form.role === "dono" ? t("buttons.proximo") : step < totalSteps ? t("buttons.proximo") : form.role === "aluno" ? t("buttons.cadastrarPagamento") : t("buttons.criarGratis")}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            {t("jaTemConta")}{" "}
            <Link href="/login" style={{ color: "var(--gold)" }} className="font-semibold">{t("entrar")}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
