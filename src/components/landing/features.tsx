const features = [
  {
    icon: "📍",
    title: "Cada presença importa",
    desc: "Check-in com geolocalização. O aluno só marca dentro do perímetro da academia. Anti-fraude integrado. Cada minuto no tatame é registrado como um passo na sua jornada.",
  },
  {
    icon: "📈",
    title: "Sua evolução em cada grau",
    desc: "Acompanhamento automático de graus e faixas. Barras de progresso que mostram exatamente onde você está e o que falta para o próximo nível. Cada aula te aproxima do seu melhor.",
  },
  {
    icon: "🏆",
    title: "O jogo de virar melhor",
    desc: "Streaks, medalhas, ranking interno, Mestre do Mês e conquistas que só quem treina de verdade conquista. Seus alunos vão competir para ser a melhor versão de si mesmos.",
  },
  {
    icon: "📊",
    title: "Dados que contam histórias",
    desc: "Métricas de retenção, frequência por faixa, crescimento mensal e evolução individual. Decisões baseadas em dados reais, não em achismo.",
  },
  {
    icon: "📱",
    title: "Sua jornada merece ser vista",
    desc: "Artes automáticas para Instagram com suas estatísticas reais. Compartilhe sua evolução e inspire sua comunidade. O melhor marketing é a história de quem transformou a vida no tatame.",
  },
  {
    icon: "👨‍🏫",
    title: "OssTrack é de todos",
    desc: "Cada professor gerencia suas turmas e confirma presenças. Dono tem visão completa. Aluno acompanha cada passo. Jiu-Jitsu é coletivo — a gestão também.",
  },
]

export function Features() {
  return (
    <section id="recursos" className="py-24 px-5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.02)] to-transparent" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Por trás do código
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            O tatame não mente. O OssTrack também não.
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Não somos mais um sistema de academia. Somos o diário de bordo de quem vive o Jiu-Jitsu de verdade.
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
