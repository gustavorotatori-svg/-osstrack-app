export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: "checkin" | "trophy" | "mural" | "evolution" | "mission"
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  const icons = {
    checkin: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
        <path d="M9 10l2 2 4-4" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
      </svg>
    ),
    trophy: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
    mural: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
        <line x1="12" y1="7" x2="12" y2="13" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
      </svg>
    ),
    evolution: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        <circle cx="12" cy="12" r="2" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
      </svg>
    ),
    mission: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
        <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
        <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2" stroke="var(--gold)" opacity="0.6" />
      </svg>
    ),
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-5">{icons[icon]}</div>
      <h3 className="text-sm font-bold text-[var(--white-muted)] mb-1.5">{title}</h3>
      <p className="text-xs text-[var(--gray)] max-w-xs leading-relaxed">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-gold px-5 py-2.5 text-xs mt-5">
          {action.label}
        </button>
      )}
    </div>
  )
}
