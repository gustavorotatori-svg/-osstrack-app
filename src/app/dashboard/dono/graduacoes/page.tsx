import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import GraduacoesClient from "./client"

export default async function GraduacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")

  return <GraduacoesClient />
}
