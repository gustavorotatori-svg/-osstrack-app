import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { TurmasClient } from "./client"

export default async function DonoTurmasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")
  return <TurmasClient />
}
