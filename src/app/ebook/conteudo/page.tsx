"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Printer } from "lucide-react"

export default function EbookConteudo() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/ebook")
    }
  }, [status, router])

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Crie uma conta gratuita para acessar o ebook.</p>
          <Link href="/cadastro?ref=ebook" className="inline-block px-6 py-3 rounded-xl text-sm font-bold btn-gold">
            Criar Conta Grátis
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-[var(--border)]" style={{ background: "var(--bg)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-3 h-3" /> Voltar
          </Link>
          <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>Ebook Gratuito</span>
          <button
            onClick={() => window.print()}
            className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}
          >
            <Printer className="w-3 h-3" /> PDF
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(212,168,71,0.1)] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔥</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            OssTrack · Ebook gratuito
          </span>
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight leading-tight mt-3 mb-3">
            Como engajar seus alunos<br />
            <span className="gradient-gold-text">e criar uma comunidade de ferro</span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Estratégias práticas de retenção, pertencimento e gamificação para sua academia de Jiu-Jitsu
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <Section title="1. O problema do esvaziamento silencioso">
            <p>
              Toda academia de Jiu-Jitsu conhece esse fenômeno: o aluno que chega empolgado, treina feito um leão por duas semanas, e de repente desaparece. A mensagem no WhatsApp fica no vácuo. O kimono encosta no armário.
            </p>
            <p>
              Não é falta de vontade. É falta de <strong>vínculo</strong>. O aluno não se sentiu parte de algo maior. Ele veio pelo Jiu-Jitsu, mas ficaria pela comunidade — e comunidade não foi construída.
            </p>
            <p>
              Estudos de retenção em artes marciais mostram que um aluno que desenvolve vínculo com o grupo nos primeiros 30 dias tem <strong>87% mais chances</strong> de permanecer ativo após 6 meses. O segredo não está no preço da mensalidade — está no engajamento diário.
            </p>
            <p className="p-4 rounded-xl font-semibold text-sm" style={{ background: "rgba(212,168,71,0.06)", borderLeft: "3px solid var(--gold)", color: "var(--gold)" }}>
              💡 Alunos não cancelam porque está caro. Eles cancelam porque não se sentem parte de algo.
            </p>
          </Section>

          <Section title="2. Pertencimento: o antídoto contra a evasão">
            <p>
              Comunidade não acontece por acaso. Ela precisa ser cultivada com intenção. Aqui estão as estratégias que academias de alto engajamento usam para criar pertencimento:
            </p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Rituais de entrada e saída</p>
            <p>O cumprimento na porta, a saudação no tatame, o bate-papo pós-treino. Parece simples, mas é o que diferencia uma academia de uma "academia de musculação com kimono". Crie momentos rituais: toda sexta-feira tem um "roda de conversa" de 5 minutos depois do treino. Aniversariante do mês ganha um parabéns coletivo. Aluno que completa 10 aulas recebe um reconhecimento público.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Espaços de convivência</p>
            <p>Se o aluno chega, treina e vai embora em 5 minutos, ele não cria laço. Incentive a permanência: um café compartilhado, um banco na área de convivência, um grupo no WhatsApp que não seja só para comunicados. O vínculo se forma nos 15 minutos pós-treino, não durante a rolagem.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>O poder do nome</p>
            <p>Professor que chama o aluno pelo nome causa um impacto profundo no engajamento. No OssTrack, você tem a lista completa de alunos com faixa, grau e frequência — use esses dados para personalizar a interação. "E aí, João. Vi que você fez 4 aulas essa semana, parabéns!" vale mais que qualquer desconto.</p>
          </Section>

          <Section title="3. Gamificação que funciona no Jiu-Jitsu">
            <p>
              Gamificação não é transformar tudo em jogo. É usar elementos de jogo para motivar comportamentos reais. No Jiu-Jitsu, isso é natural — a faixa já é uma gamificação intrínseca. Mas dá para ir além:
            </p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Streak de treinos (sequência)</p>
            <p>Nada motiva mais que uma sequência. No OssTrack, o aluno vê o streak em chamas — 3 dias, 7 dias, 30 dias. Perder o streak dói mais que perder uma luta. Use isso a seu favor. Crie um mural "Streak do Mês" na academia. Aluno com maior streak ganha um destaque.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Ranking saudável</p>
            <p>Ranking por número de presenças no mês (não por performance técnica) incentiva frequência sem gerar intimidação. O aluno que mais treinou no mês ganha um reconhecimento — pode ser um adesivo, uma camiseta, ou simplesmente o nome no quadro. No OssTrack, o ranking é automático.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Conquistas e marcos</p>
            <p>Celebre pequenas vitórias: primeira semana sem faltar, primeira finalização no roll-livre, 30 aulas completadas. Cada conquista vira uma notificação no app do aluno. Ele se sente visto. No OssTrack, as conquistas são automáticas e o aluno recebe uma badge virtual.</p>

            <p className="p-4 rounded-xl font-semibold text-sm mt-3" style={{ background: "rgba(212,168,71,0.06)", borderLeft: "3px solid var(--gold)", color: "var(--gold)" }}>
              🥋 O OssTrack foi construído com gamificação de verdade: XP, níveis de 1 a 12, streak com fogo, conquistas, ranking e Mestre do Mês. Tudo gratuito.
            </p>
          </Section>

          <Section title="4. O professor como líder da comunidade">
            <p>
              O maior fator de retenção de uma academia de Jiu-Jitsu é o professor. Não é a estrutura, não é o preço, não é a localização. É a relação professor-aluno.
            </p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Presença ativa no app</p>
            <p>Quando o professor usa o OssTrack para dar parabéns, marcar presença e interagir no mural, o engajamento da turma dobra. O professor que publica no mural da academia — um vídeo de técnica, um aviso, um incentivo — cria um fluxo de retorno diário dos alunos.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Feedback personalizado</p>
            <p>Um "parabéns pela evolução" ou "ótima rolagem hoje" dito individualmente transforma a experiência do aluno. Use os dados do OssTrack para saber quem treinou, quem está chegando atrasado, quem está sumindo — e aja antes que o aluno desista.</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>Disponibilidade genuína</p>
            <p>O professor que responde no WhatsApp, que dá atenção individual, que lembra da vida do aluno fora do tatame — esse professor forma alunos para a vida toda. Não terceirize o acolhimento.</p>
          </Section>

          <Section title="5. Estratégias de comunicação que engajam">
            <p>Não basta ter alunos — é preciso manter a chama acesa entre os treinos. Aqui estão estratégias de comunicação que funcionam:</p>

            <ul className="space-y-3 pl-5">
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>Grupo de WhatsApp bem gerido:</strong> Regras claras, conteúdo de valor, fotos dos treinos, avisos com antecedência. Nada de corrente ou mensagem irrelevante. Uma mensagem por dia, no máximo.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>Mural da academia (digital e físico):</strong> O OssTrack tem mural integrado. Publique técnica da semana, resultado de competições, parabéns para aluno que subiu de faixa. O mural gera engajamento passivo — o aluno abre o app para ver o que tem de novo.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>Desafios semanais:</strong> "Quem treina 5 dias essa semana ganha destaque no mural." "Melhor sequência de check-in do mês leva um kimono." Desafios geram movimento e conversa.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>Conteúdo que ensina fora do tatame:</strong> Vídeos curtos de técnica, dicas de alongamento, explicação de regras de competição. O aluno que consome conteúdo da academia fora do horário treina mais engajado.</span>
              </li>
            </ul>
          </Section>

          <Section title="6. Eventos e rituais que unem">
            <p>Academias com alto engajamento têm uma coisa em comum: <strong>eventos recorrentes</strong> que criam expectativa e pertencimento.</p>

            <ul className="space-y-3 pl-5">
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>Graduação coletiva:</strong> Cerimônia bimestral com entrega de faixas, presença da família, fotos. É o momento mais emocionante do calendário da academia.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>Mestre do Mês:</strong> Aluno com mais presenças no mês ganha destaque no mural, no app e nas redes sociais da academia. No OssTrack, o Mestre do Mês é automático.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>Aulas abertas e palestras:</strong> Convidar um faixa-preta de fora, fazer um seminário, um aulão de imersão no sábado. Quebra a rotina e renova o entusiasmo.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>Confraternização de fim de ano:</strong> Churrasco, amigo secreto, entrega de prêmios. A academia que celebra junto fortalece os laços para o ano seguinte.</span>
              </li>
            </ul>
          </Section>

          <Section title="7. Métricas de engajamento — o que medir">
            <p>O que não é medido não é gerenciado. Para melhorar o engajamento, você precisa saber onde está. No OssTrack, todas essas métricas estão disponíveis em tempo real:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--text-primary)" }}>Métrica</th>
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--gold)" }}>O que revela</th>
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--gold)" }}>Meta saudável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr><td className="py-2.5 px-3">Frequência semanal</td><td className="py-2.5 px-3">Quantas aulas o aluno faz por semana</td><td className="py-2.5 px-3">3+ aulas/semana</td></tr>
                  <tr><td className="py-2.5 px-3">Streak médio</td><td className="py-2.5 px-3">Dias consecutivos de treino</td><td className="py-2.5 px-3">7+ dias</td></tr>
                  <tr><td className="py-2.5 px-3">Taxa de evasão</td><td className="py-2.5 px-3">% de alunos que param sem avisar</td><td className="py-2.5 px-3">&lt; 10% ao mês</td></tr>
                  <tr><td className="py-2.5 px-3">Dias desde último treino</td><td className="py-2.5 px-3">Alunos inativos por período</td><td className="py-2.5 px-3">Alerta com 7+ dias</td></tr>
                  <tr><td className="py-2.5 px-3">Engajamento no mural</td><td className="py-2.5 px-3">Curtidas e comentários</td><td className="py-2.5 px-3">50% dos alunos ativos</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-3">No OssTrack, você vê exatamente quem está sumindo e pode agir antes do cancelamento. Um alerta de "7 dias sem treinar" dispara uma notificação para o professor — que manda um WhatsApp na hora.</p>
          </Section>

          <Section title="8. O papel da tecnologia no engajamento diário">
            <p>
              Engajamento não se sustenta no esforço manual. Você precisa de ferramentas que trabalhem por você 24 horas por dia. O OssTrack foi construído para ser o centro de engajamento da sua academia:
            </p>

            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>Check-in com streak:</strong> O aluno faz check-in, o app registra, o streak aumenta, o fogo acende. Sem esforço do professor.</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>Mural da academia:</strong> Professor publica, aluno comenta, curtidas aparecem. A comunidade interage mesmo fora do tatame.</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>Notificações inteligentes:</strong> Lembrete de treino, conquista desbloqueada, Mestre do Mês, level up. O aluno recebe estímulo positivo todo dia.</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>Ranking e competição saudável:</strong> Alunos competem por presença, não por performance. Todo mundo pode ganhar.</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>100% gratuito:</strong> Sem mensalidade, sem limite de alunos, sem plano premium. Engajamento de verdade não deveria ter barreira de entrada.</span></li>
            </ul>

            <div className="mt-4 p-4 rounded-xl text-center" style={{ background: "rgba(212,168,71,0.06)", border: "1px solid rgba(212,168,71,0.15)" }}>
              <p className="font-semibold text-sm mb-3">Quer ver na prática como o OssTrack transforma o engajamento da sua academia?</p>
              <Link
                href="/cadastro?ref=ebook"
                className="btn-gold px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                Criar conta grátis — leva 2 minutos
              </Link>
            </div>
          </Section>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16 pt-8 border-t border-[var(--border)] text-center"
        >
          <p className="text-xs font-bold" style={{ color: "var(--gold)" }}>OssTrack</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Gestão inteligente para academias de Jiu-Jitsu · 100% gratuito</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Home</Link>
            <Link href="/cadastro?ref=ebook" className="text-xs font-medium" style={{ color: "var(--gold)" }}>Criar Conta</Link>
          </div>
          <button
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(212,168,71,0.08)", color: "var(--gold)", border: "1px solid rgba(212,168,71,0.15)" }}
          >
            <Download className="w-3.5 h-3.5" /> Salvar como PDF
          </button>
        </motion.div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}
