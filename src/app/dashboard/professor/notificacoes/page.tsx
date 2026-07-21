import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { NotificacoesClient } from "@/components/notificacoes/notificacoes-client"
import { BackButton } from "@/components/ui/back-button"

export default async function ProfessorNotificacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")
  return (
    <>
      <BackButton href="/dashboard/professor" />
      <NotificacoesClient role="professor" />
    </>
  )
}
