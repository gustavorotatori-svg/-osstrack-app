"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

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
  })

  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<{ id: string; nome: string; cidade: string; estado: string }[]>([])
  const [buscando, setBuscando] = useState(false)
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    const convite = searchParams.get("convite")
    const tipo = searchParams.get("tipo")
    const academiaId = searchParams.get("academiaId")
    const academiaNome = searchParams.get("academia")
    if (convite) setForm((f) => ({ ...f, codigoConvite: convite, role: tipo || f.role, academiaId: academiaId || f.academiaId }))
  }, [searchParams])

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

    if (step === 1 && form.role === "dono") { avancarStep(); setLoading(false); return }
    if (step === 1 && form.role === "professor" && !form.codigoConvite && !form.academiaId) {
      avancarStep(); setLoading(false); return
    }
    if (step === 1 && form.role === "aluno" && !form.codigoConvite && !form.academiaId) {
      avancarStep(); setLoading(false); return
    }

    if (step === 2 && form.role === "dono") {
      if (!form.academiaNome) { setError("Informe o nome da academia"); setLoading(false); return }
      avancarStep(); setLoading(false); return
    }

    if (step === 2 && form.role === "professor" && !form.academiaId) {
      avancarStep(); setLoading(false); return
    }

    if (step === 2 && form.role === "aluno" && !form.academiaId) {
      setError("Selecione uma academia"); setLoading(false); return
    }

    if ((form.role === "aluno") && step === 3) {
      avancarStep(); setLoading(false); return
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
        body.professorId = form.professorId || undefined
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) { setError(data.error || "Erro ao criar conta"); setLoading(false); return }

      if (form.role === "aluno") {
        await fetch("/api/premium/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plano: "premium" }),
        })
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.senha,
        redirect: false,
      })

      if (result?.error) { router.push("/login"); return }

      router.push(data.redirect || "/dashboard/aluno")
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  const modalidades = ["Jiu-Jitsu", "Karatê", "Judô", "Muay Thai", "Boxe", "Capoeira", "Taekwondo", "Kung Fu", "MMA", "Outra"]

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Nome completo</label>
            <input type="text" className="input-premium" placeholder="Seu nome" required value={form.nome} onChange={(e) => update("nome", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">E-mail</label>
            <input type="email" className="input-premium" placeholder="seu@email.com" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Telefone</label>
            <input type="tel" className="input-premium" placeholder="(81) 99999-8888" required value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Senha</label>
            <input type="password" className="input-premium" placeholder="Mínimo 6 caracteres" required minLength={6} value={form.senha} onChange={(e) => update("senha", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Tipo de conta</label>
            <select className="input-premium appearance-none" value={form.role} onChange={(e) => { update("role", e.target.value); setStep(1) }}>
              <option value="dono">Dono de Academia</option>
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>
        </>
      )
    }

    if (step === 2 && form.role === "dono") {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Nome da Academia</label>
            <input type="text" className="input-premium" placeholder="Ex: Gracie Barra Recife" required value={form.academiaNome} onChange={(e) => update("academiaNome", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Endereço</label>
            <input type="text" className="input-premium" placeholder="Rua, número, bairro" value={form.academiaEndereco} onChange={(e) => update("academiaEndereco", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Cidade / Estado</label>
            <input type="text" className="input-premium" placeholder="Recife/PE" value={form.academiaCidade} onChange={(e) => update("academiaCidade", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Modalidades</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {modalidades.map((mod) => (
                <label key={mod} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-[var(--dark-border)] transition-all">
                  <input type="checkbox" className="accent-[var(--gold)]" checked={form.academiaModalidades.includes(mod)} onChange={() => toggleModalidade(mod)} />
                  {mod}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Raio para check-in (metros)</label>
            <input type="number" className="input-premium" placeholder="200" value={form.academiaRaio} onChange={(e) => update("academiaRaio", Number(e.target.value))} />
          </div>
        </>
      )
    }

    if ((step === 2 && form.role === "professor") || (step === 2 && form.role === "aluno")) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--white-muted)]">
            {form.role === "professor" ? "Busque a academia onde você dá aulas:" : "Busque sua academia:"}
          </p>
          <div className="relative">
            <input
              type="text"
              className="input-premium"
              placeholder="Digite o nome da academia..."
              value={busca}
              onChange={(e) => buscarAcademias(e.target.value)}
            />
            {buscando && <span className="absolute right-3 top-3 text-xs text-[var(--gold)]">Buscando...</span>}
          </div>
          {resultados.length > 0 && (
            <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
              {resultados.map((acad) => (
                <button
                  key={acad.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-[var(--gold)]/10 transition-colors border-b border-[var(--dark-border)] last:border-0"
                  onClick={() => selecionarAcademia(acad)}
                >
                  <span className="text-sm font-medium">{acad.nome}</span>
                  {acad.cidade && <span className="text-xs text-[var(--white-muted)] ml-2">{acad.cidade}/{acad.estado}</span>}
                </button>
              ))}
            </div>
          )}
          {form.academiaId && (
            <div className="bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-xl px-4 py-3">
              <p className="text-xs text-[var(--gold)] font-semibold">Academia selecionada</p>
              <p className="text-sm font-medium">{form.academiaNome}</p>
            </div>
          )}
          {form.role === "professor" && (
            <p className="text-xs text-[var(--white-muted)] text-center pt-2">
              Não encontrou? Pode continuar sem academia e conectar depois.
            </p>
          )}
        </div>
      )
    }

    if (form.role === "aluno" && step === 3) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--white-muted)]">Selecione seu professor (opcional):</p>
          {professores.length === 0 ? (
            <div>
              <input
                type="text"
                className="input-premium"
                placeholder="Nome do professor..."
                value={form.professorId}
                onChange={async (e) => {
                  update("professorId", e.target.value)
                  if (e.target.value.length < 2) return
                  const res = await fetch(`/api/professores?q=${encodeURIComponent(e.target.value)}&academiaId=${form.academiaId}`)
                  if (res.ok) {
                    const data = await res.json()
                    setProfessores(data)
                  }
                }}
              />
              {professores.length > 0 && (
                <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden mt-2">
                  {professores.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-[var(--gold)]/10 transition-colors"
                      onClick={() => { update("professorId", prof.id); setProfessores([]) }}
                    >
                      {prof.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
              {professores.map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-[var(--gold)]/10 transition-colors border-b border-[var(--dark-border)] last:border-0"
                  onClick={() => selecionarProfessor(prof)}
                >
                  {prof.nome}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--white-muted)] text-center pt-2">Pode pular essa etapa.</p>
        </div>
      )
    }

    if (form.role === "aluno" && step === 4) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="text-lg font-bold">Plano Premium</h3>
            <p className="text-2xl font-extrabold text-[var(--gold)]">R$ 4,90<span className="text-sm text-[var(--white-muted)] font-normal">/mês</span></p>
            <p className="text-xs text-[var(--white-muted)] mt-1">Acesso completo por apenas R$4,90/mês. Cancele quando quiser.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Número do cartão</label>
            <input type="text" className="input-premium" placeholder="0000 0000 0000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Validade</label>
              <input type="text" className="input-premium" placeholder="MM/AA" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">CVV</label>
              <input type="text" className="input-premium" placeholder="123" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Nome no cartão</label>
            <input type="text" className="input-premium" placeholder="Como está no cartão" />
          </div>
          <p className="text-[10px] text-[var(--white-muted)] text-center">
            * Simulação. Em produção, integração com Stripe será ativada.
          </p>
        </div>
      )
    }

    return null
  }

  function selecionarProfessor(prof: { id: string; nome: string }) {
    update("professorId", prof.id)
    setProfessores([])
  }

  const totalSteps = form.role === "dono" ? 2 : form.role === "professor" ? (form.academiaId || form.codigoConvite ? 1 : 2) : form.codigoConvite && form.academiaId ? 4 : 4

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[var(--gold)]/4 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">🥋</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Criar Conta</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1.5">
            {form.role === "aluno" ? (
              <>Grátis por <span className="text-[var(--gold)] font-bold">7 dias</span>. Depois <span className="text-[var(--gold)] font-bold">R$4,90/mês</span>.</>
            ) : (
              <>Comece gratuitamente por <span className="text-[var(--gold)] font-bold">7 dias</span>. Sem cartão de crédito.</>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-7 space-y-4">
          {renderStep()}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button type="button" onClick={voltarStep} className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-all">
                Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm ${loading ? "bg-[var(--dark-border)] text-[var(--gray)] cursor-not-allowed" : "btn-gold"}`}
            >
              {loading ? "Criando conta..." : step === 1 && form.role === "dono" ? "Próximo" : step < totalSteps ? "Próximo" : form.role === "aluno" ? "Assinar R$ 4,90" : "Criar Conta Grátis"}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--white-muted)]">
            Já tem conta?{" "}
            <Link href="/login" className="text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
