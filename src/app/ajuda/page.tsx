import type { Metadata } from "next"
import Script from "next/script"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { AjudaView } from "./client"

export const metadata: Metadata = {
  title: "Ajuda — OssTrack",
  description: "Tire suas dúvidas sobre o OssTrack: como funciona o check-in, progressão de faixas, planos e mais. Entre em contato com o suporte.",
  alternates: { canonical: "/ajuda" },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é o OssTrack?",
      acceptedAnswer: { "@type": "Answer", text: "O OssTrack é uma plataforma de gestão e evolução para academias de Jiu-Jitsu. Ajudamos academias, professores e alunos a acompanharem presenças, progressão nas faixas, streaks, conquistas e muito mais — tudo com foco em motivação e disciplina." },
    },
    {
      "@type": "Question",
      name: "Quanto custa?",
      acceptedAnswer: { "@type": "Answer", text: "Academias e professores não pagam nada — é gratuito. Todas as funcionalidades são 100% gratuitas para alunos, incluindo gráficos de evolução, conquistas especiais e o Mestre do Mês." },
    },
    {
      "@type": "Question",
      name: "Como funciona o check-in?",
      acceptedAnswer: { "@type": "Answer", text: "O aluno abre o app na hora do treino e toca em 'Fazer Check-in'. A plataforma usa a geolocalização do celular para confirmar que o aluno está na academia. O professor também pode registrar a presença manualmente." },
    },
    {
      "@type": "Question",
      name: "Preciso de um aplicativo separado?",
      acceptedAnswer: { "@type": "Answer", text: "Não. O OssTrack funciona direto do navegador do celular — não precisa instalar nada. Você pode adicionar a página à tela inicial do seu celular para acesso rápido como se fosse um app." },
    },
    {
      "@type": "Question",
      name: "Como funciona a progressão de faixas?",
      acceptedAnswer: { "@type": "Answer", text: "O dono da academia configura as regras de graduação (número de aulas por grau, critérios para cada faixa). O sistema calcula automaticamente o progresso de cada aluno e sugere quando ele está apto a mudar de grau ou faixa." },
    },
    {
      "@type": "Question",
      name: "Meus dados estão seguros?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. Todos os dados são transmitidos com criptografia HTTPS/TLS e armazenados em banco criptografado em repouso. Senhas são hashadas com bcrypt. Não armazenamos números de cartão de crédito — os pagamentos são processados diretamente pelo Stripe (certificado PCI DSS Nível 1)." },
    },
    {
      "@type": "Question",
      name: "Posso usar o OssTrack em várias academias?",
      acceptedAnswer: { "@type": "Answer", text: "Professores podem ser vinculados a múltiplas academias. Alunos pertencem a uma única academia por vez. Donos podem gerenciar uma ou mais academias com a mesma conta." },
    },
    {
      "@type": "Question",
      name: "Como entrar em contato com o suporte?",
      acceptedAnswer: { "@type": "Answer", text: "Use o formulário 'Fale Conosco' na página de Ajuda, envie um e-mail para passador@osstrack.com ou mande uma mensagem no WhatsApp." },
    },
  ],
}

export default function AjudaPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Script id="faq-schema" type="application/ld+json" strategy="beforeInteractive">{JSON.stringify(faqSchema)}</Script>
      <Navbar />
      <AjudaView />
      <Footer />
    </main>
  )
}
