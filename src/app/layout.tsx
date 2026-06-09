import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"

const title = "OssTrack — Sua jornada no tatame"
const description =
  "Plataforma de evolução para academias de Jiu-Jitsu. Transforme frequência, disciplina e evolução em metas claras e compartilháveis."
const url = "https://osstrack.app"

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(url),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "OssTrack",
    title,
    description,
    url,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "OssTrack" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
