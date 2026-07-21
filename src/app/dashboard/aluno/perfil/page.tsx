import { BackButton } from "@/components/ui/back-button"
import PerfilClient from "../../shared/perfil-client"

export default function PerfilPage() {
  return (
    <>
      <BackButton href="/dashboard/aluno" />
      <PerfilClient role="aluno" />
    </>
  )
}
