const features = [
  {
    icon: "📍",
    title: "Check-in Inteligente",
    desc: "Check-in com geolocalização. Aluno só faz check-in dentro da academia. Anti-fraude integrado.",
  },
  {
    icon: "📈",
    title: "Evolução Visual",
    desc: "Acompanhamento automático de graus e faixas. Barras de progresso motivacionais em tempo real.",
  },
  {
    icon: "🏆",
    title: "Gamificação",
    desc: "Streaks, medalhas, ranking interno e conquistas desbloqueáveis para manter alunos engajados.",
  },
  {
    icon: "📊",
    title: "Relatórios Poderosos",
    desc: "Métricas de retenção, frequência, crescimento e evolução. Decisões baseadas em dados.",
  },
  {
    icon: "📱",
    title: "Compartilhamento Social",
    desc: "Artes automáticas para Instagram. Alunos compartilham conquistas e promovem sua academia.",
  },
  {
    icon: "👨‍🏫",
    title: "Gestão de Professores",
    desc: "Cada professor gerencia suas turmas e confirma presenças. Controle total para o dono.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-20 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1.5 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-wider mb-4">
            Recursos
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Tudo que sua academia precisa
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Uma plataforma completa para gestão de evolução, frequência e engajamento dos seus alunos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-8 transition-all hover:border-[rgba(201,168,76,0.3)] hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] flex items-center justify-center text-xl mb-5">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
