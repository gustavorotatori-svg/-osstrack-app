import PerfilClient from "../../shared/perfil-client"
import { BackButton } from "@/components/ui/back-button"

export default function DonoPerfilPage() {
  return (
    <>
      <BackButton href="/dashboard/dono" />
      <PerfilClient role="dono" />
    </>
  )
}
