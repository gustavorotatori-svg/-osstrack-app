import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "E-book Gratuito: Como Engajar Alunos no Jiu-Jitsu — OssTrack",
  description:
    "Baixe o e-book gratuito e descubra estratégias comprovadas para aumentar o engajamento, retenção e comunidade na sua academia de Jiu-Jitsu.",
  alternates: { canonical: "/ebook" },
  openGraph: {
    title: "E-book Gratuito: Como Engajar Alunos no Jiu-Jitsu",
    description:
      "10 minutos de leitura. Estratégias reais de engajamento, retenção e comunidade para academias de Jiu-Jitsu.",
    url: "https://osstrack.com.br/ebook",
  },
}

export default function EbookLayout({ children }: { children: React.ReactNode }) {
  return children
}
