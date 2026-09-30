"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useT } from "@/lib/use-t"

export function FreeSection() {
  const t = useT("gratuito")
  return (
    <section id="gratis" className="py-32 px-5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight leading-tight mb-4">
            {t("titulo")}{" "}
            <span className="gradient-gold-text">{t("tituloDestaque")}</span>
          </h2>

          <p className="text-[var(--white-muted)] text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            {t("descricao")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Link
            href="/cadastro"
            className="btn-gold px-12 py-5 text-base font-bold inline-block hover:scale-105 transition-transform active:scale-95 shadow-[0_8px_40px_rgba(212,168,71,0.2)]"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}