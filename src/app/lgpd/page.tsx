import type { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { LgpdView } from "./client"

export const metadata: Metadata = {
  title: "Política de Privacidade — OssTrack",
  description: "Saiba como o OssTrack protege seus dados em conformidade com a LGPD. Política de privacidade, cookies, segurança e direitos do usuário.",
  alternates: { canonical: "/lgpd" },
}

export default function LgpdPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Navbar />
      <LgpdView />
      <Footer />
    </main>
  )
}
