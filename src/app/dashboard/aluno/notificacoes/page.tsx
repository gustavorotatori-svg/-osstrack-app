import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { BackButton } from "@/components/ui/back-button"
import { NotificacoesClient } from "@/components/notificacoes/notificacoes-client"

export default async function AlunoNotificacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")
  return (
    <>
      <BackButton href="/dashboard/aluno" />
      <NotificacoesClient role="aluno" />
    </>
  )
}
