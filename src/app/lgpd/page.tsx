import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { LockIcon } from "@/components/ui/icons"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade — OssTrack",
  description: "Saiba como o OssTrack protege seus dados em conformidade com a LGPD. Política de privacidade, cookies, segurança e direitos do usuário.",
}

const sections = [
  {
    title: "1. Dados que Coletamos",
    content: "Coletamos apenas os dados essenciais para o funcionamento da plataforma: nome, e-mail, telefone, foto de perfil, faixa e grau no Jiu-Jitsu, registros de presença (com geolocalização no momento do check-in), dados de pagamento (processados exclusivamente pelo Stripe, sem armazenar números de cartão) e informações de uso da plataforma."
  },
  {
    title: "2. Para que Usamos Seus Dados",
    content: "Seus dados são utilizados para: registrar e exibir seu histórico de presenças e evolução nas faixas, calcular streaks e conquistas, gerar rankings na academia, gerenciar a plataforma, enviar notificações relevantes via WhatsApp ou e-mail, e melhorar continuamente a experiência da plataforma."
  },
  {
    title: "3. Compartilhamento de Dados",
    content: "Não vendemos seus dados para terceiros. Compartilhamos apenas com processadores essenciais: Stripe (pagamentos), Neon PostgreSQL (armazenamento), Vercel (hospedagem). Seus dados de presença e progresso são visíveis para os professores e dono da sua academia, dentro dos limites da plataforma."
  },
  {
    title: "4. Seus Direitos (LGPD)",
    content: "Você tem direito a: acessar todos os dados que armazenamos sobre você, solicitar correção de dados incompletos ou desatualizados, solicitar exclusão dos seus dados (sujeito a retenções legais), revogar consentimento a qualquer momento, e exportar seus dados em formato estruturado. Para exercer qualquer direito, entre em contato pelo e-mail privacidade@osstrack.app."
  },
  {
    title: "5. Nossas Ferramentas de Segurança",
    content: "Toda comunicação com a plataforma é criptografada via HTTPS/TLS. Os dados armazenados no banco PostgreSQL (Neon) são criptografados em repouso. Senhas são hashadas com bcrypt. A geolocalização dos check-ins é usada apenas no momento do registro para validar presença e não é rastreada continuamente. Não armazenamos números de cartão de crédito — todo pagamento é processado diretamente pelo Stripe, que é certificado PCI DSS Nível 1. Controles de acesso baseados em função (RBAC) garantem que cada usuário veja apenas o que precisa. Realizamos backups automáticos diários do banco de dados."
  },
  {
    title: "6. Cookies",
    content: "Utilizamos cookies essenciais para autenticação e funcionamento da plataforma (NextAuth session token). Não utilizamos cookies de rastreamento ou publicidade. Você pode controlar os cookies nas configurações do seu navegador, mas a desativação de cookies essenciais pode afetar o funcionamento da plataforma."
  },
  {
    title: "7. Retenção de Dados",
    content: "Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, os dados são anonimizados ou excluídos em até 30 dias, exceto quando a retenção for exigida por lei."
  },
  {
    title: "8. Contato do DPO",
    content: "Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso Encarregado (DPO) pelo e-mail privacidade@osstrack.app ou pelo formulário de contato na página de Ajuda."
  },
]

export default function LgpdPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início
          </Link>
          <div className="text-center mb-12">
            <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4"><LockIcon className="w-6 h-6 text-black" /></div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">Política de Privacidade</h1>
            <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
              Como protegemos seus dados e respeitamos sua privacidade no OssTrack, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="text-xs text-[var(--gray)] mt-2">Última atualização: 29 de maio de 2026</div>
          </div>

          <div className="space-y-4">
            {sections.map((s) => (
              <div key={s.title} className="glass-card p-6 md:p-8">
                <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{s.title}</h2>
                <p className="text-sm text-[var(--white-muted)] leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
