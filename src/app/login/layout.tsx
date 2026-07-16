import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entrar — OssTrack",
  description: "Faça login no OssTrack e acompanhe sua evolução no Jiu-Jitsu. Presenças, faixas, conquistas e estatísticas em um só lugar.",
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
