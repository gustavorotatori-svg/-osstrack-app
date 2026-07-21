import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AlunosClient } from "./client"
import { BackButton } from "@/components/ui/back-button"

export default async function DonoAlunosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")
  return (
    <>
      <BackButton href="/dashboard/dono" />
      <AlunosClient />
    </>
  )
}
