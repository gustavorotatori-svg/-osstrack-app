"use client"

import { useT } from "@/lib/use-t"

const FAQS = [
  {
    q: "O OssTrack é realmente gratuito?",
    a: "Sim. O OssTrack é 100% gratuito para a academia, os professores e os alunos — sem planos escondidos, sem limite de alunos e sem cartão de crédito.",
  },
  {
    q: "O que o OssTrack faz?",
    a: "Check-in dos alunos por GPS, progressão de faixas e graduações, streaks, ranking, controle de frequência, financeiro e relatórios — tudo em um só lugar, no navegador.",
  },
  {
    q: "Preciso instalar um aplicativo?",
    a: "Não. O OssTrack funciona direto no navegador do celular ou do computador. Você pode adicioná-lo à tela inicial e usá-lo como um aplicativo (PWA).",
  },
  {
    q: "Como funciona o check-in?",
    a: "O aluno abre o OssTrack na hora da aula e faz o check-in com o GPS da academia. A presença é registrada automaticamente na turma e no horário corretos.",
  },
  {
    q: "Serve para qualquer tamanho de academia?",
    a: "Sim. De turmas pequenas a grandes equipes, o OssTrack acompanha frequência, progressão e retenção dos alunos em tempo real.",
  },
]

export function Faq() {
  const t = useT("faq")
  return (
    <section id="faq" className="relative py-24 px-5" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-black mb-4">
          <span className="gradient-gold-text">{t("title")}</span>
        </h2>
        <p className="text-center mb-12" style={{ color: "var(--text-secondary)" }}>
          {t("subtitle")}
        </p>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details
              key={faq.q}
              className="group rounded-2xl border p-5 open:border-[var(--gold)] transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer font-bold list-none text-base md:text-lg" style={{ color: "var(--text)" }}>
                <span>{t(`q${i + 1}`)}</span>
                <span className="text-xl shrink-0 transition-transform group-open:rotate-45" style={{ color: "var(--gold)" }}>+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
                {t(`a${i + 1}`)}
              </p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq, i) => ({
              "@type": "Question",
              name: t(`q${i + 1}`),
              acceptedAnswer: { "@type": "Answer", text: t(`a${i + 1}`) },
            })),
          }),
        }}
      />
    </section>
  )
}
