import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { AjudaClient } from "./client"
import { enviarContato } from "./actions"
import { HelpIcon, MailIcon } from "@/components/ui/icons"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Ajuda — OssTrack",
  description: "Tire suas dúvidas sobre o OssTrack: como funciona o check-in, progressão de faixas, planos e mais. Entre em contato com o suporte.",
}

const faqItems = [
  {
    q: "O que é o OssTrack?",
    r: "O OssTrack é uma plataforma de gestão e evolução para academias de Jiu-Jitsu. Ajudamos academias, professores e alunos a acompanharem presenças, progressão nas faixas, streaks, conquistas e muito mais — tudo com foco em motivação e disciplina."
  },
  {
    q: "Quanto custa?",
    r: "Academias e professores não pagam nada — é gratuito para sempre. Todas as funcionalidades são 100% gratuitas para alunos, incluindo gráficos de evolução, conquistas especiais e o Mestre do Mês."
  },
  {
    q: "Como funciona o check-in?",
    r: "O aluno abre o app na hora do treino e toca em 'Fazer Check-in'. A plataforma usa a geolocalização do celular para confirmar que o aluno está na academia. O professor também pode registrar a presença manualmente."
  },
  {
    q: "Preciso de um aplicativo separado?",
    r: "Não. O OssTrack funciona direto do navegador do celular — não precisa instalar nada. Você pode adicionar a página à tela inicial do seu celular para acesso rápido como se fosse um app."
  },
  {
    q: "Como funciona a progressão de faixas?",
    r: "O dono da academia configura as regras de graduação (número de aulas por grau, critérios para cada faixa). O sistema calcula automaticamente o progresso de cada aluno e sugere quando ele está apto a mudar de grau ou faixa."
  },
  {
    q: "Meus dados estão seguros?",
    r: "Sim. Todos os dados são transmitidos com criptografia HTTPS/TLS e armazenados em banco criptografado em repouso. Senhas são hashadas com bcrypt. Não armazenamos números de cartão de crédito — os pagamentos são processados diretamente pelo Stripe (certificado PCI DSS Nível 1)."
  },
  {
    q: "Posso usar o OssTrack em várias academias?",
    r: "Professores podem ser vinculados a múltiplas academias. Alunos pertencem a uma única academia por vez. Donos podem gerenciar uma ou mais academias com a mesma conta."
  },
  {
    q: "Como entrar em contato com o suporte?",
    r: "Use o formulário 'Fale Conosco' abaixo, envie um e-mail para suporte@osstrack.app ou mande uma mensagem no WhatsApp: (48) 99631-0359."
  },
]

export default function AjudaPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início
          </Link>
          <div className="text-center mb-12">
            <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4"><HelpIcon className="w-6 h-6 text-black" /></div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">Ajuda</h1>
            <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
              Tire suas dúvidas ou entre em contato com a gente.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <HelpIcon className="w-5 h-5 text-[var(--gold)]" /> Perguntas Frequentes
            </h2>
            <AjudaClient items={faqItems} />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-[var(--gold)]" /> Fale Conosco
            </h2>
            <div className="glass-card p-6 md:p-8">
              <p className="text-sm text-[var(--white-muted)] mb-6">
                Não encontrou sua resposta? Mande uma mensagem que responderemos em até 24 horas úteis.
              </p>
              <ContatoForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function ContatoForm() {
  return (
    <form action={enviarContato} className="space-y-4" id="contato-form">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">Nome</label>
          <input id="nome" name="nome" type="text" required placeholder="Seu nome"
            className="input-field" />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">E-mail</label>
          <input id="email" name="email" type="email" required placeholder="seu@email.com"
            className="input-field" />
        </div>
      </div>
      <div>
        <label htmlFor="mensagem" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">Mensagem</label>
        <textarea id="mensagem" name="mensagem" required rows={5} placeholder="Como podemos ajudar?"
          className="input-field resize-none" />
      </div>
      <button type="submit"
        className="btn-gold px-8 py-3.5 text-sm font-bold w-full md:w-auto active:scale-[0.98]">
        Enviar Mensagem
      </button>
    </form>
  )
}
