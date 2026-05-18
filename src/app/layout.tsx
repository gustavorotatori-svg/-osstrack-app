import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"

export const metadata: Metadata = {
  title: "OssTrack — Sua jornada no tatame",
  description:
    "Plataforma de evolução para academias de Jiu-Jitsu. Transforme frequência, disciplina e evolução em metas claras e compartilháveis.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
