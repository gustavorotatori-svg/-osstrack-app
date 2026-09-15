import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Como Engajar Alunos no Jiu-Jitsu — E-book Gratuito | OssTrack",
  description:
    "Leia agora o e-book gratuito com estratégias de engajamento, retenção e comunidade para academias de Jiu-Jitsu.",
  alternates: { canonical: "/ebook/conteudo" },
  openGraph: {
    title: "Como Engajar Alunos no Jiu-Jitsu — E-book Gratuito",
    description:
      "Estratégias reais de engajamento, retenção e comunidade para academias de Jiu-Jitsu.",
    url: "https://osstrack.com.br/ebook/conteudo",
  },
}

export default function EbookConteudoLayout({ children }: { children: React.ReactNode }) {
  return children
}
