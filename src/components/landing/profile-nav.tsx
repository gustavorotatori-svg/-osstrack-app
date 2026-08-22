"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const profiles = [
  {
    slug: "dono",
    title: "Dono",
    desc: "Gestão completa da sua academia",
    gradient: "linear-gradient(135deg, #d4a847, #8a6e2a)",
    features: ["Financeiro", "Alunos", "Relatórios", "Cobranças", "Waiver"],
  },
  {
    slug: "professor",
    title: "Professor",
    desc: "Turmas, alunos e evolução",
    gradient: "linear-gradient(135deg, #6366f1, #4338ca)",
    features: ["Turmas", "Presenças", "Graduações", "Mural"],
  },
  {
    slug: "aluno",
    title: "Aluno",
    desc: "Sua jornada no tatame",
    gradient: "linear-gradient(135deg, #059669, #065f46)",
    features: ["Evolução", "Horas", "Streak", "Ranking", "Google Login"],
  },
]

const cardRadius = ["24px 8px 24px 8px", "8px 24px 8px 24px", "20px 4px 20px 4px"]

export function ProfileNav() {
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight leading-tight"
          >
            Três jornadas,{" "}
            <span className="text-[var(--gold)]">um só app</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[var(--text-secondary)] leading-relaxed max-w-sm shrink-0"
          >
            Cada experiência é única. Escolha seu caminho.
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-4">
          {profiles.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ flex: "1 1 280px", minWidth: 0 }}
            >
              <Link
                href={`/cadastro?role=${p.slug}`}
                className="group block relative overflow-hidden h-full"
                style={{ borderRadius: cardRadius[i] }}
              >
                <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105" style={{ background: p.gradient }} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                <div style={{ borderRadius: cardRadius[i] }} className="relative p-6 md:p-8 flex flex-col justify-between h-full border border-white/10 min-h-[200px]">
                  <div>
                    <span className="text-4xl font-black text-white/20 block mb-2">0{i + 1}</span>
                    <h3 className="text-2xl font-black text-white tracking-tight">{p.title}</h3>
                    <p className="text-sm text-white/80 mt-1 font-medium">{p.desc}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {p.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/15 text-white/90"
                      >
                        {f}
                      </span>
                    ))}
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
