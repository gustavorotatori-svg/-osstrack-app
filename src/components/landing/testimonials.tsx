const testimonials = [
  {
    initials: "CM", name: "Carlos Mota", role: "Mestre — Gracie Barra Recife",
    text: "O OssTrack revolucionou nossa academia. A retenção de alunos aumentou 40% em apenas 3 meses. Os alunos amam ver o progresso visual e competir no ranking.",
  },
  {
    initials: "AS", name: "André Santos", role: "Professor — Alliance SP",
    text: "O compartilhamento social gerou um marketing orgânico incrível. Os alunos postam as conquistas automaticamente e atraem novos membros naturalmente.",
  },
  {
    initials: "PL", name: "Paulo Lima", role: "CEO — Nova União JJ",
    text: "A gamificação salvou nosso engajamento pós-pandemia. Os alunos competem pra ver quem tem o maior streak. Nunca vi algo tão efetivo.",
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-24 px-5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.02)] to-transparent" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Depoimentos
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            O que dizem os mestres
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Academias que transformaram sua gestão com OssTrack.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-7 transition-all duration-300 hover:border-[rgba(201,168,76,0.2)] hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-[var(--gold)] text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed italic mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center font-bold text-sm text-black shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-[var(--white-muted)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
