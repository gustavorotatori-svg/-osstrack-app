import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { ProfileNav } from "@/components/landing/profile-nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { FreeSection } from "@/components/landing/free-section"
import { EbookSection } from "@/components/landing/ebook-section"

import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/layout/navbar"
import { AmbientSoundToggle } from "@/components/landing/ambient-sound"
import { WhatsAppFab } from "@/components/landing/whatsapp-fab"
import { BackToTop } from "@/components/landing/back-to-top"
import { MobileCta } from "@/components/landing/mobile-cta"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export default function Home() {
  return (
    <main className="tatame-bg overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <ProfileNav />
      <HowItWorks />
      <Testimonials />
      <FreeSection />
      <EbookSection />
      <Footer />
      <WhatsAppFab />
      <BackToTop />
      <MobileCta />
      <InstallPrompt />
      <AmbientSoundToggle />
    </main>
  )
}
