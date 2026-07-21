"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    const role = session.user.role
    if (role === "aluno") router.push("/dashboard/aluno")
    else if (role === "professor") router.push("/dashboard/professor")
    else if (role === "dono") router.push("/dashboard/dono")
    else router.push("/login")
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center text-lg text-black animate-pulse">
          🥋
        </div>
        <p className="text-sm text-[var(--white-muted)]">Redirecionando...</p>
      </div>
    </div>
  )
}
