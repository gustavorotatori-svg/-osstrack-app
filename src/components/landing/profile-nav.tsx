"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const profiles = [
  {
    slug: "dono",
    title: "Dono",
    desc: "Gestão completa da sua academia",
    gradient: "linear-gradient(135deg, #d4a847, #8a6e2a)",
    color: "#d4a847",
    features: ["Financeiro", "Alunos", "Relatórios", "Check-ins"],
    href: "#",
  },
  {
    slug: "professor",
    title: "Professor",
    desc: "Turmas, alunos e evolução",
    gradient: "linear-gradient(135deg, #6366f1, #4338ca)",
    color: "#6366f1",
    features: ["Turmas", "Presenças", "Graduações", "Mural"],
    href: "#",
  },
  {
    slug: "aluno",
    title: "Aluno",
    desc: "Sua jornada no tatame",
    gradient: "linear-gradient(135deg, #059669, #065f46)",
    color: "#059669",
    features: ["Evolução", "Streak", "Ranking", "Metas"],
    href: "#",
  },
]

export function ProfileNav() {
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
          >
            PARA QUEM É
          </motion.span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            Três jornadas, um só app
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Cada experiência é única. Escolha seu caminho.
          </p>
        </motion.div>

        <div className="space-y-4">
          {profiles.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={p.href}
                className="group block relative overflow-hidden rounded-2xl border border-[var(--dark-border)]"
              >
                <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105" style={{ background: p.gradient }} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar/number circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0 border-2 border-white/20"
                      style={{ background: "rgba(0,0,0,0.2)" }}
                    >
                      <span className="text-white">{p.title[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{p.title}</h3>
                      <p className="text-sm text-white/80 mt-0.5 font-medium">{p.desc}</p>
                    </div>
                  </div>

                  {/* Features pills */}
                  <div className="flex flex-wrap gap-2">
                    {p.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                      >
                        {f}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all duration-300 group-hover:bg-white group-hover:text-black"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                      Explorar →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
