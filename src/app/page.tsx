import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { Plans } from "@/components/landing/plans"
import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/layout/navbar"
import { AmbientSoundToggle } from "@/components/landing/ambient-sound"

export default function Home() {
  return (
    <main className="tatame-bg">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Plans />
      <Footer />
      <AmbientSoundToggle />
    </main>
  )
}
