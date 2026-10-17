import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role
  if (role === "aluno") redirect("/dashboard/aluno")
  else if (role === "professor") redirect("/dashboard/professor")
  else if (role === "dono") redirect("/dashboard/dono")
  else redirect("/login")
}
