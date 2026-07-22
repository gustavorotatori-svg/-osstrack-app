import type { Metadata } from "next"
import Link from "next/link"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { ProfileNav } from "@/components/landing/profile-nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { FreeSection } from "@/components/landing/free-section"
import { EbookSection } from "@/components/landing/ebook-section"
import prisma from "@/lib/prisma"

import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/layout/navbar"
import { AmbientSoundToggle } from "@/components/landing/ambient-sound"
import { WhatsAppFab } from "@/components/landing/whatsapp-fab"
import { BackToTop } from "@/components/landing/back-to-top"
import { MobileCta } from "@/components/landing/mobile-cta"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export const revalidate = 300

export const metadata: Metadata = {
  title: "OssTrack — Gestão de Academias de Jiu-Jitsu",
  description:
    "Plataforma gratuita para academias de Jiu-Jitsu: check-in, progressão de faixas, streaks, gamificação e relatórios. Comece agora.",
  openGraph: {
    title: "OssTrack — Gestão de Academias de Jiu-Jitsu",
    description:
      "Plataforma gratuita para academias de Jiu-Jitsu: check-in, progressão de faixas, streaks e gamificação.",
  },
}

export default async function Home() {
  let totalAcademias = 0, totalAlunos = 0, retencao = 0
  try {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [academias, alunos, alunosAtivos30d] = await Promise.all([
      prisma.academia.count(),
      prisma.usuario.count({ where: { role: "aluno" } }),
      prisma.presenca.findMany({
        where: { createdAt: { gte: trintaDiasAtras }, status: "confirmed" },
        select: { alunoId: true },
        distinct: ["alunoId"],
      }).then((r) => r.length),
    ])
    totalAcademias = academias
    totalAlunos = alunos
    retencao = totalAlunos > 0 ? Math.round((alunosAtivos30d / totalAlunos) * 100) : 0
  } catch {
    // fallback: stats will show 0 during build or DB outages
  }

  return (
    <main id="main-content" className="tatame-bg overflow-x-hidden">
      <Navbar />
      <Hero stats={{ academias: totalAcademias, alunos: totalAlunos, retencao }} />
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
