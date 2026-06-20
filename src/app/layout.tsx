import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { CookieConsent } from "@/components/layout/cookie-consent"

const title = "OssTrack — Sua jornada no tatame"
const description =
  "Plataforma de evolução para academias de Jiu-Jitsu. Transforme frequência, disciplina e evolução em metas claras e compartilháveis."
const url = "https://osstrack.app"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OssTrack",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS, Android",
  description,
  url,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  author: {
    "@type": "Organization",
    name: "OssTrack",
  },
}

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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("osstrack_theme");if(!t)t="dark";document.documentElement.className=t}catch(e){document.documentElement.className="dark"}})()`
        }} />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OssTrack" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
