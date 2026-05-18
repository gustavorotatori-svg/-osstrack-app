import Link from "next/link"

const plans = [
  {
    name: "Básico", price: "R$97", period: "Até 50 alunos", featured: false,
    features: ["Check-in geolocalizado", "Dashboard do aluno", "Controle de presença", "Sistema de evolução"],
  },
  {
    name: "Profissional", price: "R$197", period: "Até 150 alunos", featured: true,
    features: ["Tudo do Básico", "Gamificação completa", "Relatórios avançados", "Compartilhamento social", "Múltiplos professores"],
  },
  {
    name: "Premium", price: "R$397", period: "Alunos ilimitados", featured: false,
    features: ["Tudo do Profissional", "Multi-unidades", "API personalizada", "Suporte prioritário", "Onboarding dedicado"],
  },
]

export function Plans() {
  return (
    <section id="planos" className="py-20 px-5 bg-[var(--dark)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1.5 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-wider mb-4">
            Planos
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Invista na evolução
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Planos para academias de todos os tamanhos. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`bg-[var(--dark-card)] border rounded-2xl p-8 transition-all relative ${
                p.featured ? "border-[var(--gold)] scale-105" : "border-[var(--dark-border)]"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-gold rounded-full text-[11px] font-bold text-black tracking-wider">
                  MAIS POPULAR
                </div>
              )}
              <div className="text-xl font-bold mb-2">{p.name}</div>
              <div className="text-sm text-[var(--white-muted)] mb-6">{p.period}</div>
              <div className="text-[2.625rem] font-black tracking-tight mb-1">
                {p.price} <span className="text-base font-normal text-[var(--white-muted)]">/mês</span>
              </div>
              <ul className="space-y-3 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2.5 border-b border-[var(--dark-border)] pb-3">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/cadastro"
                className={`block text-center py-3.5 rounded-lg font-bold text-sm transition-all ${
                  p.featured
                    ? "gradient-gold text-black"
                    : "border border-[var(--dark-border)] text-white hover:border-[var(--gold)]"
                }`}
              >
                Começar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
