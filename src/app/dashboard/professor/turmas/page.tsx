import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { TurmasClient } from "@/app/dashboard/dono/turmas/client"

export default async function ProfessorTurmasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")
  return <TurmasClient role="professor" />
}
