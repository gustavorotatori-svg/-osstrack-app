import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import GraduacoesClient from "../../dono/graduacoes/client"

export default async function ProfessorGraduacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  return <GraduacoesClient role="professor" />
}
