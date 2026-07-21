import PerfilClient from "../../shared/perfil-client"
import { BackButton } from "@/components/ui/back-button"

export default function ProfessorPerfilPage() {
  return (
    <>
      <BackButton href="/dashboard/professor" />
      <PerfilClient role="professor" />
    </>
  )
}
