import type { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { TermosView } from "./client"

export const metadata: Metadata = {
  title: "Termos de Uso — OssTrack",
  description: "Termos e condições de uso da plataforma OssTrack para academias de Jiu-Jitsu.",
  alternates: { canonical: "/termos" },
}

export default function TermosPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Navbar />
      <TermosView />
      <Footer />
    </main>
  )
}
