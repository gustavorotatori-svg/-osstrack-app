import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recuperar Senha — OssTrack",
  description: "Recupere o acesso à sua conta OssTrack. Enviaremos um link de redefinição de senha para seu e-mail cadastrado.",
}

export default function RecuperarSenhaLayout({ children }: { children: React.ReactNode }) {
  return children
}
