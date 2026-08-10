import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { CookieConsent } from "@/components/layout/cookie-consent"

const title = "OssTrack — Sua jornada no tatame"
const description =
  "Plataforma de evolução para academias de Jiu-Jitsu. Transforme frequência, disciplina e evolução em metas claras e compartilháveis."
const url = "https://osstrack.com.br"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OssTrack",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
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
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "OssTrack",
    title,
    description,
    url,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
        <style>{`#skip-to-content{position:absolute;top:-100%;left:8px;z-index:9999;padding:8px 16px;background:var(--gold);color:#000;font-size:14px;font-weight:700;border-radius:0 0 8px 8px;text-decoration:none;transition:top .15s}#skip-to-content:focus{top:0;outline:2px solid var(--gold)}`}</style>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var p=localStorage.getItem("osstrack_theme_pref");document.documentElement.className=(p==="light")?"light":"dark"}catch(e){document.documentElement.className="dark"}})()`
        }} />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <Script id="schema-jsonld" type="application/ld+json" strategy="beforeInteractive">{JSON.stringify(jsonLd)}</Script>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OssTrack" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f5f0" media="(prefers-color-scheme: light)" />
        <link rel="mask-icon" href="/icon-192.svg" color="#d4a847" />
      </head>
      <body className="antialiased">
        <a id="skip-to-content" href="#main-content">Ir para o conteúdo</a>
        <div id="main-content">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
        </div>
      </body>
    </html>
  )
}
