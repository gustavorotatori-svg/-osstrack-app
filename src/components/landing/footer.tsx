export function Footer() {
  return (
    <footer className="py-14 px-5 border-t border-[var(--dark-border)] text-center">
      <div className="text-xl font-extrabold mb-4">🥋 OssTrack</div>
      <div className="flex justify-center gap-6 flex-wrap mb-6">
        {["Recursos", "Planos", "Blog", "Suporte", "Termos", "Privacidade"].map((l) => (
          <a key={l} href="#" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">
            {l}
          </a>
        ))}
      </div>
      <div className="text-xs text-[var(--gray)]">
        <p>© 2026 OssTrack. &ldquo;Toda presença conta.&rdquo;</p>
        <p className="mt-1">🇧🇷 Feito com dedicação para o Jiu-Jitsu brasileiro.</p>
      </div>
    </footer>
  )
}
