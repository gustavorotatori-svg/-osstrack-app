"use client"

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <CardSkeleton />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 animate-fade-in stagger-${i}`}>
            <Skeleton className="h-6 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}
