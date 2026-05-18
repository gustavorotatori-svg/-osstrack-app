import Link from "next/link"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-5 pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero z-0" />
      <div className="relative z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] rounded-full text-sm text-[var(--gold)] font-medium mb-6">
          🥋 Transformando academias de Jiu-Jitsu
        </div>

        <h1 className="text-[clamp(2.25rem,8vw,4.5rem)] font-black leading-[1.05] tracking-[-2px] mb-5">
          Sua jornada no{" "}
          <span className="bg-gradient-to-r from-[var(--gold)] via-yellow-300 to-[var(--gold)] bg-clip-text text-transparent">
            tatame
          </span>{" "}
          começa aqui.
        </h1>

        <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-[var(--white-muted)] max-w-xl mx-auto mb-9 leading-relaxed">
          Transforme frequência, disciplina e evolução no Jiu-Jitsu em metas claras e compartilháveis. Aumente retenção e engajamento dos seus alunos.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/cadastro"
            className="px-7 py-4 rounded-lg font-bold text-base gradient-gold text-black shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_30px_rgba(201,168,76,0.4)] hover:-translate-y-0.5 transition-all"
          >
            Começar Grátis
          </Link>
          <Link
            href="/login"
            className="px-7 py-4 rounded-lg font-bold text-base border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
          >
            Fazer Login
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5 mt-14 max-w-md mx-auto">
          {[
            { value: "500+", label: "Academias" },
            { value: "15k+", label: "Alunos Ativos" },
            { value: "98%", label: "Satisfação" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-[var(--gold)]">{s.value}</div>
              <div className="text-xs text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
