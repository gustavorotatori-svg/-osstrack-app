import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Redefinir Senha — OssTrack",
  description: "Defina uma nova senha para sua conta OssTrack e recupere o acesso à plataforma.",
  robots: { index: false, follow: false },
}

export default function RedefinirSenhaLayout({ children }: { children: React.ReactNode }) {
  return children
}
