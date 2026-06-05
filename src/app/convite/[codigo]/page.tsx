import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function ConvitePage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const convite = await prisma.convite.findUnique({
    where: { codigo },
    include: { academia: { select: { id: true, nome: true } } },
  })

  if (!convite || convite.usado || (convite.expiresAt && convite.expiresAt < new Date())) {
    redirect("/cadastro")
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
