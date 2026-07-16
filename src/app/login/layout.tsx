import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entrar — OssTrack",
  description: "Faça login no OssTrack e acompanhe sua evolução no Jiu-Jitsu. Presenças, faixas, conquistas e estatísticas em um só lugar.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
