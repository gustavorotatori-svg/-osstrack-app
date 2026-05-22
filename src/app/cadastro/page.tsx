"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Cadastro() {
  const [step, setStep] = useState(1)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/login")
  }

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
          <p className="text-sm text-[var(--white-muted)] mt-1.5">Comece gratuitamente por 14 dias</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-7 space-y-4.5">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Nome completo</label>
                <input type="text" className="input-premium" placeholder="Seu nome" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">E-mail</label>
                <input type="email" className="input-premium" placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Telefone</label>
                <input type="tel" className="input-premium" placeholder="(81) 99999-8888" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Senha</label>
                <input type="password" className="input-premium" placeholder="Mínimo 6 caracteres" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Tipo de conta</label>
                <select className="input-premium appearance-none" required>
                  <option value="dono">Dono de Academia</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Nome da Academia</label>
                <input type="text" className="input-premium" placeholder="Ex: Gracie Barra Recife" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Endereço</label>
                <input type="text" className="input-premium" placeholder="Rua, número, bairro" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Cidade / Estado</label>
                <input type="text" className="input-premium" placeholder="Recife/PE" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Raio para check-in (metros)</label>
                <input type="number" className="input-premium" placeholder="200" defaultValue={200} required />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-all">
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="flex-1 py-3.5 rounded-xl font-bold text-sm btn-gold">
                Próximo
              </button>
            ) : (
              <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-sm btn-gold">
                Criar Conta Grátis
              </button>
            )}
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
