const steps = [
  { num: "1", title: "Cadastre sua Academia", desc: "Informe os dados, defina o raio de check-in e pronto." },
  { num: "2", title: "Adicione Professores", desc: "Vinculando professores às turmas e horários." },
  { num: "3", title: "Alunos fazem Check-in", desc: "Com geolocalização, dentro do perímetro da academia." },
  { num: "4", title: "Acompanhe a Evolução", desc: "Graus, faixas, streaks e conquistas automáticas." },
]

export function HowItWorks() {
  return (
    <section id="funciona" className="py-20 px-5 bg-[var(--dark)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1.5 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-wider mb-4">
            Como Funciona
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Simples como um golpe básico
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            Em poucos passos sua academia está funcionando com o OssTrack.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center text-xl font-extrabold text-black mx-auto mb-4">
                {s.num}
              </div>
              <h4 className="text-lg font-bold mb-2">{s.title}</h4>
              <p className="text-sm text-[var(--white-muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
