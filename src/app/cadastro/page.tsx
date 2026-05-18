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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🥋</div>
          <h1 className="text-2xl font-extrabold">Criar Conta</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1">Comece gratuitamente por 14 dias</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-7 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Nome completo</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="Seu nome" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">E-mail</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Telefone</label>
                <input type="tel" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="(81) 99999-8888" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Senha</label>
                <input type="password" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="Mínimo 6 caracteres" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Tipo de conta</label>
                <select className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all appearance-none" required>
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
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Nome da Academia</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="Ex: Gracie Barra Recife" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Endereço</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="Rua, número, bairro" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Cidade / Estado</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="Recife/PE" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Raio para check-in (metros)</label>
                <input type="number" className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" placeholder="200" defaultValue={200} required />
              </div>
            </>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3.5 rounded-lg font-bold text-sm border border-[var(--dark-border)] text-white transition-all">
                Voltar
              </button>
            )}
            {step < 2 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="flex-1 py-3.5 rounded-lg font-bold gradient-gold text-black transition-all">
                Próximo
              </button>
            ) : (
              <button type="submit" className="flex-1 py-3.5 rounded-lg font-bold gradient-gold text-black transition-all">
                Criar Conta Grátis
              </button>
            )}
          </div>

          <p className="text-center text-xs text-[var(--white-muted)]">
            Já tem conta?{" "}
            <Link href="/login" className="text-[var(--gold)] font-semibold">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
