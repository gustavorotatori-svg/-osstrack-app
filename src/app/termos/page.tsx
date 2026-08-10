import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/landing/footer"
import { ArrowLeft } from "lucide-react"


export const metadata: Metadata = {
  title: "Termos de Uso — OssTrack",
  description: "Termos e condições de uso da plataforma OssTrack para academias de Jiu-Jitsu.",
}

export default function TermosPage() {
  return (
    <main className="tatame-bg min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao início
          </Link>
          <div className="text-center mb-12">
            <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">Termos de Uso</h1>
            <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
              Ao utilizar o OssTrack, você concorda com os termos e condições descritos abaixo.
            </p>
            <div className="text-xs text-[var(--gray)] mt-2">Última atualização: 13 de junho de 2026</div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">1. Aceitação dos Termos</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                Ao criar uma conta no OssTrack, você declara ter lido, compreendido e aceitado estes Termos de Uso e nossa{" "}
                <Link href="/lgpd" className="text-[var(--gold)] font-semibold hover:underline">Política de Privacidade</Link>.
                Caso não concorde com qualquer disposição, não utilize a plataforma.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">2. Conta e Responsabilidades</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                Você é o único responsável por manter a confidencialidade dos seus dados de acesso (e-mail e senha).
                Todas as atividades realizadas na sua conta são de sua responsabilidade. Você deve nos informar
                imediatamente sobre qualquer uso não autorizado da sua conta. O cadastro é permitido apenas para
                maiores de 18 anos ou menores com autorização dos responsáveis legais.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">3. Uso da Plataforma</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                O OssTrack é uma plataforma gratuita de gerenciamento para academias de Jiu-Jitsu. Você concorda em
                utilizar a plataforma apenas para fins lícitos e de acordo com estes termos. Não nos responsabilizamos
                por decisões pedagógicas, técnicas ou administrativas tomadas com base nos dados exibidos.
                É proibido utilizar a plataforma para armazenar conteúdo ilegal, difamatório ou que viole direitos de terceiros.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">4. Privacidade e Dados</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                Seus dados pessoais são tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                Coletamos apenas os dados necessários ao funcionamento da plataforma. Seus dados nunca são vendidos
                para terceiros. Para detalhes completos sobre o tratamento dos seus dados, consulte nossa{" "}
                <Link href="/lgpd" className="text-[var(--gold)] font-semibold hover:underline">Política de Privacidade</Link>.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">5. Cancelamento e Exclusão</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                Você pode excluir sua conta a qualquer momento através da opção "Excluir minha conta" na página de
                Perfil. Os dados serão removidos permanentemente em até 30 dias após a solicitação, exceto quando a
                retenção for exigida por lei. Você também pode solicitar a exclusão dos seus dados entrando em
                contato pelo e-mail passador@osstrack.com.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3 text-[var(--gold)]">6. Limitação de Responsabilidade</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                O OssTrack é fornecido "como está", sem garantias de disponibilidade contínua ou ininterrupta.
                Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso ou da impossibilidade
                de uso da plataforma, incluindo perda de dados, lucros cessantes ou interrupção de negócios.
                A plataforma pode ser modificada, suspensa ou descontinuada a qualquer momento, mediante aviso prévio.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8">
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--gold)" }}>7. Disposições Gerais</h2>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">
                Estes termos são regidos pela legislação brasileira. Qualquer disputa será resolvida no foro da
                comarca do usuário. Caso qualquer disposição destes termos seja considerada inválida ou inexequível,
                as demais disposições permanecerão em pleno vigor. O não exercício de qualquer direito previsto
                nestes termos não constitui renúncia.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
