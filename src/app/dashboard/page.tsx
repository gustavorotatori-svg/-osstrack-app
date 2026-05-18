import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const role = session.user.role
  if (role === "aluno") redirect("/dashboard/aluno")
  if (role === "professor") redirect("/dashboard/professor")
  if (role === "dono") redirect("/dashboard/dono")

  redirect("/login")
}
