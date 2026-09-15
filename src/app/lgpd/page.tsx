import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { LockIcon } from "@/components/ui/icons"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade — OssTrack",
  description: "Saiba como o OssTrack protege seus dados em conformidade com a LGPD. Política de privacidade, cookies, segurança e direitos do usuário.",
  alternates: { canonical: "/lgpd" },
}

const sections = [
  {
    title: "1. Dados que Coletamos",
    content: "Coletamos apenas os dados essenciais para o funcionamento da plataforma: nome, e-mail, telefone, foto de perfil, faixa e grau no Jiu-Jitsu, data de nascimento, registros de presença (com geolocalização no momento do check-in), termo de responsabilidade (nome completo, CPF, endereço IP e dados do dispositivo) caso sua academia exija, e informações de uso em formato estatístico. Caso sua academia ative cobranças, os dados de pagamento são processados exclusivamente pelo Stripe, sem armazenar números de cartão em nossos servidores."
  },
  {
    title: "2. Para que Usamos Seus Dados",
    content: "Seus dados são utilizados para: registrar e exibir seu histórico de presenças e evolução nas faixas, calcular streaks e conquistas, gerar rankings na academia, gerenciar a plataforma, enviar notificações relevantes via WhatsApp ou e-mail, e melhorar continuamente a experiência da plataforma."
  },
  {
    title: "3. Bases Legais para o Tratamento",
    content: "Tratamos seus dados com fundamento na LGPD (Lei 13.709/2018): (a) execução do contrato, para o funcionamento da plataforma e gestão de presenças, turmas, cobranças e rankings da sua academia; (b) consentimento, para envio de notificações de marketing e para o termo de responsabilidade (waiver); e (c) legítimo interesse, para melhorias de segurança e prevenção a fraudes. Dados de menores de 18 anos dependem do consentimento específico do responsável legal (Art. 14)."
  },
  {
    title: "4. Compartilhamento e Transferência de Dados",
    content: "Não vendemos seus dados para terceiros. Compartilhamos apenas com processadores essenciais ao funcionamento: Neon PostgreSQL (armazenamento), Vercel (hospedagem e analytics) e, quando houver cobranças, Stripe (processamento de pagamentos). Esses serviços podem estar localizados fora do Brasil; a transferência internacional ocorre com base em cláusulas contratuais padrão e nas garantias exigidas pela LGPD (Art. 33). Seus dados de presença e progresso são visíveis para os professores e dono da sua academia, dentro dos limites da plataforma."
  },
  {
    title: "5. Seus Direitos (LGPD)",
    content: "Você tem direito a: acessar todos os dados que armazenamos sobre você, solicitar correção de dados incompletos ou desatualizados, solicitar anonimização ou exclusão dos seus dados (sujeito a retenções legais), revogar consentimento a qualquer momento, opor-se a determinados tratamentos, portabilidade e informação sobre compartilhamentos. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD). Para exercer qualquer direito, entre em contato pelo e-mail passador@osstrack.com."
  },
  {
    title: "6. Dados de Crianças e Adolescentes (Art. 14 LGPD)",
    content: "Para o cadastro de menores de 18 anos, exigimos o consentimento do responsável legal, que deve informar seu nome e CPF no momento do cadastro. O responsável pode, a qualquer momento, solicitar acesso, retificação, portabilidade ou exclusão dos dados do menor pelo e-mail passador@osstrack.com. Os dados de crianças e adolescentes são tratados com prioridade máxima de proteção e apenas na estrita medida necessária para o funcionamento da plataforma."
  },
  {
    title: "7. Nossas Ferramentas de Segurança",
    content: "Toda comunicação com a plataforma é criptografada via HTTPS/TLS. Os dados armazenados no banco PostgreSQL (Neon) são criptografados em repouso, e dados sensíveis como CPF são criptografados individualmente. Senhas são hashadas com bcrypt. A geolocalização dos check-ins é usada apenas no momento do registro para validar presença e não é rastreada continuamente. Quando houver cobranças, não armazenamos números de cartão de crédito — o pagamento é processado diretamente pelo Stripe, certificado PCI DSS Nível 1. Controles de acesso baseados em função (RBAC) garantem que cada usuário veja apenas o que precisa. Realizamos backups automáticos diários do banco de dados."
  },
  {
    title: "8. Cookies e Analytics",
    content: "Utilizamos cookies essenciais para autenticação e funcionamento da plataforma (sessão do NextAuth). Para medir o desempenho e melhorar a experiência, utilizamos o Vercel Web Analytics, que coleta estatísticas agregadas e anônimas de uso (como número de visitas e páginas mais acessadas), sem cookies de publicidade ou rastreamento cross-site. Você pode controlar os cookies nas configurações do seu navegador, mas a desativação de cookies essenciais pode afetar o funcionamento da plataforma."
  },
  {
    title: "9. Retenção de Dados",
    content: "Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão da conta, os dados pessoais são anonimizados ou excluídos imediatamente, exceto quando a retenção for exigida por lei. Antes de completar 18 anos, dados de menores são mantidos apenas com o consentimento do responsável e são eliminados assim que o tratamento deixar de ser necessário."
  },
  {
    title: "10. Contato do Encarregado (DPO)",
    content: "Para questões relacionadas à privacidade e proteção de dados, inclusive para exercer seus direitos como titular, entre em contato com nosso Encarregado (DPO) pelo e-mail passador@osstrack.com ou pelo formulário de contato na página de Ajuda."
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
            <div className="text-xs text-[var(--gray)] mt-2">Última atualização: 30 de agosto de 2026</div>
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
