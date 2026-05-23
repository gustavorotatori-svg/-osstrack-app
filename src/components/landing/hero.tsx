import Link from "next/link"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-5 pt-36 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gold)]/3 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--red)]/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-sm text-[var(--gold)] font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Transformando academias de Jiu-Jitsu
        </div>

        <h1 className="text-[clamp(2.5rem,9vw,5rem)] font-black leading-[1.05] tracking-[-3px] mb-6 animate-fade-in-up">
          Sua jornada no{" "}
          <span className="gradient-gold-text">tatame</span>
          <br />
          começa aqui.
        </h1>

        <p className="text-[clamp(1rem,2.5vw,1.3rem)] text-[var(--white-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1">
          Academia e professor: R$0. Aluno premium: R$4,90. Simples.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in-up stagger-2">
          <Link
            href="/cadastro"
            className="btn-gold px-8 py-4 text-base shadow-[0_4px_30px_rgba(201,168,76,0.2)]"
          >
            Começar Grátis
            <span className="ml-2">→</span>
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl font-bold text-base border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300"
          >
            Fazer Login
          </Link>
        </div>

        <div className="flex items-center justify-center gap-8 md:gap-14 mt-16 animate-fade-in-up stagger-3">
          {[
            { value: "500+", label: "Academias" },
            { value: "15k+", label: "Alunos Ativos" },
            { value: "98%", label: "Satisfação" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black gradient-gold-text">{s.value}</div>
              <div className="text-xs text-[var(--white-muted)] mt-1.5 tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
