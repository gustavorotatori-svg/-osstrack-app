import Link from "next/link"

const plans = [
  {
    name: "Academia Grátis", price: "R$0", period: "Pra sempre", featured: false,
    features: [
      "Academia cadastrada sem custo",
      "Check-in geolocalizado",
      "Dashboard do aluno",
      "Controle de presença",
      "Ranking da academia",
      "Mural social",
    ],
    cta: "Cadastrar academia",
    href: "/cadastro",
  },
  {
    name: "Aluno Premium", price: "R$4,90", period: "Por aluno/mês", featured: true,
    features: [
      "Tudo do Free",
      "Histórico ilimitado",
      "Arte para Instagram 🎨",
      "Metas semanais personalizadas",
      "Badge Mestre do Mês 👑",
      "Onboarding gamificado (7 missões)",
      "Compartilhar conquistas",
    ],
    cta: "Quero Premium",
    href: "/login",
  },
  {
    name: "Academia Premium", price: "Grátis", period: "Seus alunos pagam", featured: false,
    features: [
      "Academia 100% free",
      "Zero investimento",
      "Seus alunos viram atletas",
      "Relatórios mensais",
      "Suporte prioritário",
      "Sem taxa de adesão",
    ],
    cta: "Quero para minha academia",
    href: "/cadastro",
  },
]

export function Plans() {
  return (
    <section id="planos" className="py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Planos
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Academia grátis. Aluno paga R$4,90.
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Sua academia não tira nada do bolso. Quem quiser recursos premium, paga só o valor de um café por mês.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 transition-all duration-300 animate-fade-in-up relative ${
                p.featured
                  ? "gradient-gold-border bg-[var(--dark-card)] scale-[1.02] md:scale-105"
                  : "bg-[var(--dark-card)] border border-[var(--dark-border)] hover:border-[rgba(201,168,76,0.2)]"
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 gradient-gold rounded-full text-[11px] font-bold text-black tracking-wider shadow-lg">
                  MAIS POPULAR
                </div>
              )}
              <div className="text-lg font-bold mb-1.5">{p.name}</div>
              <div className="text-sm text-[var(--white-muted)] mb-6">{p.period}</div>
              <div className="text-[2.75rem] font-black tracking-tight mb-6">
                {p.price} <span className="text-sm font-normal text-[var(--white-muted)]">/mês</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 text-xs shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  p.featured
                    ? "btn-gold"
                    : "border border-[var(--dark-border)] text-white hover:border-[var(--gold)]"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
