import type { Metadata } from "next"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { ProfileNav } from "@/components/landing/profile-nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FreeSection } from "@/components/landing/free-section"
import { EbookSection } from "@/components/landing/ebook-section"
import { Faq } from "@/components/landing/faq"

import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/layout/navbar"
import { WhatsAppFab } from "@/components/landing/whatsapp-fab"
import { MobileCta } from "@/components/landing/mobile-cta"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { ExitIntentPopup } from "@/components/landing/exit-intent-popup"

export const revalidate = 300

export const metadata: Metadata = {
  title: "OssTrack — Gestão de Academias de Jiu-Jitsu (Grátis)",
  description:
    "Plataforma gratuita para academias de Jiu-Jitsu: check-in, progressão de faixas, streaks, gamificação e relatórios. Comece agora.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "OssTrack — Gestão de Academias de Jiu-Jitsu (Grátis)",
    description:
      "Plataforma gratuita para academias de Jiu-Jitsu: check-in, progressão de faixas, streaks e gamificação.",
  },
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://osstrack.com.br/#organization",
      name: "OssTrack",
      url: "https://osstrack.com.br",
      logo: { "@type": "ImageObject", url: "https://osstrack.com.br/icon-192.svg" },
    },
    {
      "@type": "WebSite",
      "@id": "https://osstrack.com.br/#website",
      url: "https://osstrack.com.br",
      name: "OssTrack",
      description:
        "Plataforma gratuita para academias de Jiu-Jitsu: check-in, faixas, streaks, ranking e gestão completa.",
      inLanguage: "pt-BR",
      publisher: { "@id": "https://osstrack.com.br/#organization" },
    },
  ],
}

export default async function Home() {

  return (
    <main className="tatame-bg overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Navbar />
      <Hero />
      <Features />
      <ProfileNav />
      <HowItWorks />
      <Faq />
      <FreeSection />
      <EbookSection />
      <Footer />
      <WhatsAppFab />
      <MobileCta />
      <InstallPrompt />
      <ExitIntentPopup />
    </main>
  )
}
