"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function Cadastro() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

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
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (step === 1 && form.role === "dono") {
      setStep(2)
      setLoading(false)
      return
    }

    if (step === 2 && form.role === "dono") {
      if (!form.academiaNome) {
        setError("Informe o nome da academia")
        setLoading(false)
        return
      }
    }

    try {
      const body: Record<string, unknown> = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
        role: form.role,
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
        body.academiaId = form.academiaId
        body.professorId = form.professorId || undefined
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.senha,
        redirect: false,
      })

      if (result?.error) {
        router.push("/login")
        return
      }

      router.push(data.redirect || "/dashboard/aluno")
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  const modalidades = ["Jiu-Jitsu", "Karatê", "Judô", "Muay Thai", "Boxe", "Capoeira", "Taekwondo", "Kung Fu", "MMA", "Outra"]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[var(--gold)]/4 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
            🥋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Criar Conta</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1.5">
            Comece gratuitamente por <span className="text-[var(--gold)] font-bold">7 dias</span>. Sem cartão de crédito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-7 space-y-4">
          {step === 1 && (
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
                <select className="input-premium appearance-none" value={form.role} onChange={(e) => update("role", e.target.value)}>
                  <option value="dono">Dono de Academia</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && form.role === "dono" && (
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
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-all">
                Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm ${loading ? "bg-[var(--dark-border)] text-[var(--gray)] cursor-not-allowed" : "btn-gold"}`}
            >
              {loading ? "Criando conta..." : step === 1 && form.role === "dono" ? "Próximo" : "Criar Conta Grátis"}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--white-muted)]">
            Já tem conta?{" "}
            <Link href="/login" className="text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
