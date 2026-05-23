"use client"

export function PremiumLock({ children, isLocked }: { children: React.ReactNode; isLocked: boolean }) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative group">
      <div className="pointer-events-none select-none">
        <div className="blur-[2px] opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-[var(--white-muted)]">Funcionalidade Premium</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PremiumBanner({ onClick }: { onClick?: () => void }) {
  return (
    <div className="bg-gradient-to-r from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.02)] border border-[var(--gold)]/20 rounded-2xl p-5 text-center hover-card">
      <div className="text-3xl mb-2">👑</div>
      <h3 className="font-bold text-sm text-[var(--gold)]">OssTrack Premium</h3>
      <p className="text-xs text-[var(--white-muted)] mt-1 mb-4">
        Desbloqueie arte para Instagram, metas personalizadas, histórico ilimitado e muito mais!
      </p>
      <button
        onClick={onClick}
        className="btn-gold px-6 py-2.5 text-xs font-bold"
      >
        Assinar por R$4,90/mês
      </button>
    </div>
  )
}
