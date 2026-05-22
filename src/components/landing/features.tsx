const features = [
  {
    icon: "📍",
    title: "Check-in Inteligente",
    desc: "Check-in com geolocalização. O aluno só consegue marcar presença dentro do perímetro da academia. Anti-fraude integrado.",
  },
  {
    icon: "📈",
    title: "Evolução Visual",
    desc: "Acompanhamento automático de graus e faixas. Barras de progresso motivacionais que mostram exatamente o quanto falta para o próximo nível.",
  },
  {
    icon: "🏆",
    title: "Gamificação Completa",
    desc: "Streaks, medalhas, ranking interno, Mestre do Mês e conquistas desbloqueáveis. Seus alunos vão competir para treinar mais.",
  },
  {
    icon: "📊",
    title: "Relatórios Poderosos",
    desc: "Métricas de retenção, frequência por faixa, crescimento mensal e evolução individual. Decisões baseadas em dados reais.",
  },
  {
    icon: "📱",
    title: "Compartilhamento Social",
    desc: "Artes automáticas para Instagram. Seus alunos compartilham conquistas e promovem sua academia organicamente.",
  },
  {
    icon: "👨‍🏫",
    title: "Gestão Completa",
    desc: "Cada professor gerencia suas turmas e confirma presenças. Controle total para o dono com visão geral da academia.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-24 px-5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.02)] to-transparent" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Recursos
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Tudo que sua academia precisa
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Uma plataforma completa para gestão de evolução, frequência e engajamento dos seus alunos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-7 transition-all duration-300 hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(201,168,76,0.12)] to-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-lg mb-4 group-hover:border-[rgba(201,168,76,0.3)] transition-all">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2.5">{f.title}</h3>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
