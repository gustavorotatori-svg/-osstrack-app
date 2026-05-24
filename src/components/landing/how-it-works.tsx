const steps = [
  { num: "1", title: "Sua academia no mapa", desc: "Cadastre sua academia, defina o perímetro e pronto. Em menos de 5 minutos seu tatame existe no mundo digital." },
  { num: "2", title: "Seu time, suas regras", desc: "Adicione professores às turmas e horários. Cada um com seu painel. O dono enxerga tudo. O professor enxerga o que importa." },
  { num: "3", title: "Viver o Jiu-Jitsu", desc: "Alunos fazem check-in com geolocalização. Cada presença é um degrau. Cada streak, uma prova de compromisso. Anti-fraude protege a verdade do tatame." },
  { num: "4", title: "A história se escreve sozinha", desc: "Graus, faixas, streaks, ranking, conquistas. Tudo automático. Enquanto você ensina e treina, o OssTrack cuida do resto." },
]

export function HowItWorks() {
  return (
    <section id="funciona" className="py-24 px-5 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Como funciona
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Menos burocracia. Mais Jiu-Jitsu.
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Você se dedicou anos para construir sua academia. A gente criou o OssTrack pra você não precisar se dedicar a planilhas.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.2)] to-transparent" />

          {steps.map((s, i) => (
            <div key={s.num} className="text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-5 relative z-10 shadow-[0_4px_20px_rgba(201,168,76,0.2)]">
                {s.num}
              </div>
              <h4 className="text-base font-bold mb-3">{s.title}</h4>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
