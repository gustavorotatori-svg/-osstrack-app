"use client"

import { motion } from "framer-motion"
import { useT } from "@/lib/use-t"

const testimonialsData = [
  {
    initials: "CM", name: "Carlos Mota", role: "Mestre — Iron BJJ Team",
    text: "O OssTrack nos fez perceber que cada presença é uma história. Meus alunos não faltam mais porque não querem quebrar o streak. O engajamento mudou completamente. Mas o mais bonito é ver eles celebrando cada conquista como se fosse a primeira.",
  },
  {
    initials: "AS", name: "André Santos", role: "Professor — Força Jiu-Jitsu",
    text: "O compartilhamento social foi um divisor de águas. Os alunos postam as artes automáticas no Instagram e os amigos perguntam 'onde é essa academia?'. Marketing orgânico de verdade, sem pagar um centavo.",
  },
  {
    initials: "PL", name: "Paulo Lima", role: "CEO — Serra JJ",
    text: "Depois da pandemia, o engajamento tinha despencado. O OssTrack trouxe de volta. Os alunos competem pra ver quem tem o maior streak, disputam o Mestre do Mês. O tatame nunca esteve tão cheio.",
  },
  {
    initials: "RM", name: "Ricardo Martins", role: "Professor — Titan JJ",
    text: "Implementei o OssTrack e unifiquei a gestão. O controle de presença e a relação com os pais dos alunos menores de idade mudou completamente nossa operação.",
  },
  {
    initials: "LF", name: "Luiz Fernando", role: "Dono — Oss JJ Team",
    text: "Eu usava planilha no Excel e grupo de WhatsApp. Hoje tenho relatório de tudo. Quem treina mais, quem está sumido, quem precisa de atenção. Parece que contratei um funcionário só pra isso.",
  },
]

const avatarColors = ["#d4a847", "#2563eb", "#9333ea", "#059669", "#dc2626"]

export function Testimonials() {
  const t = useT("testimonials")

  return (
    <section id="depoimentos" className="py-24 px-5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-2xl"
        >
          <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold tracking-tight">
            {t("titulo")}
          </h2>
          <p className="text-[var(--white-muted)] text-sm leading-relaxed mt-2">{t("subtitulo")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonialsData.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="bg-[var(--bg-card)] border border-[var(--dark-border)] rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:border-[rgba(201,168,76,0.2)]"
            >
              <p className="text-sm text-[var(--white-muted)] leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3.5 mt-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[(i + 1) % avatarColors.length]})`,
                  }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-[var(--white-muted)]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}