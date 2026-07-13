import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const convite = await prisma.convite.findUnique({
    where: { codigo },
    include: { academia: { select: { id: true, nome: true } } },
  })

  if (!convite) {
    return (
      <main className="tatame-bg min-h-screen flex items-center justify-center p-5">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-black tracking-tight mb-2">Convite Inválido</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Este link de convite não existe ou é inválido.
          </p>
          <Link href="/cadastro" className="btn-gold px-6 py-3 text-sm font-bold inline-block">
            Criar Conta Grátis
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (convite.usado) {
    return (
      <main className="tatame-bg min-h-screen flex items-center justify-center p-5">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-black tracking-tight mb-2">Convite já utilizado</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Este convite já foi usado. Se você já tem conta, faça login.
          </p>
          <Link href="/login" className="btn-gold px-6 py-3 text-sm font-bold inline-block">
            Fazer Login
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (convite.expiresAt && convite.expiresAt < new Date()) {
    return (
      <main className="tatame-bg min-h-screen flex items-center justify-center p-5">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-black tracking-tight mb-2">Convite Expirado</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Este convite expirou. Peça para quem te convidou gerar um novo link.
          </p>
          <Link href="/cadastro" className="btn-gold px-6 py-3 text-sm font-bold inline-block">
            Criar Conta Grátis
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const qs = new URLSearchParams({
    convite: codigo,
    tipo: convite.tipo === "academia" ? "dono" : convite.tipo,
    academiaId: convite.academiaId || "",
    academia: convite.academia?.nome || "",
  })

  if (convite.tipo === "academia" && convite.remetenteId) {
    qs.set("professorId", convite.remetenteId)
  }

  redirect(`/cadastro?${qs.toString()}`)
}
