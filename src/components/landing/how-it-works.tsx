const steps = [
  { num: "1", title: "Cadastre sua Academia", desc: "Informe os dados da sua academia, defina o raio de check-in e pronto. Menos de 5 minutos." },
  { num: "2", title: "Adicione Professores", desc: "Vinculando professores às turmas e horários. Cada um com seu painel de controle." },
  { num: "3", title: "Alunos fazem Check-in", desc: "Com geolocalização, dentro do perímetro da academia. Anti-fraude ativo 100% do tempo." },
  { num: "4", title: "Acompanhe a Evolução", desc: "Graus, faixas, streaks, ranking e conquistas. Tudo automático e em tempo real." },
]

export function HowItWorks() {
  return (
    <section id="funciona" className="py-24 px-5 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Como Funciona
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Simples como um golpe básico
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Em poucos passos sua academia está funcionando com o OssTrack.
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
