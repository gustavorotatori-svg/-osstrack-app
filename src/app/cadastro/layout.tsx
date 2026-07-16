import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Criar Conta — OssTrack",
  description: "Crie sua conta no OssTrack gratuitamente. Gerencie sua academia de Jiu-Jitsu, acompanhe presenças, progressão de faixas e muito mais.",
  robots: { index: false, follow: false },
}

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return children
}
