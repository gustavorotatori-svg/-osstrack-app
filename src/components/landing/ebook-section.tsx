"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useT } from "@/lib/use-t"
import { BookOpen, Download, Heart, Zap, Users, Award } from "lucide-react"

const benefits = [
  { icon: Heart, tKey: "b1Title", dKey: "b1Desc" },
  { icon: Zap, tKey: "b2Title", dKey: "b2Desc" },
  { icon: Users, tKey: "b3Title", dKey: "b3Desc" },
  { icon: Award, tKey: "b4Title", dKey: "b4Desc" },
]

export function EbookSection() {
  const t = useT("ebook")
  return (
    <section className="relative py-24 px-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,168,71,0.03)] via-[rgba(212,168,71,0.01)] to-[rgba(212,168,71,0.03)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Book mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-full max-w-[380px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)",
                border: "1px solid rgba(212,168,71,0.2)",
              }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />

              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[rgba(212,168,71,0.3)] rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[rgba(212,168,71,0.3)] rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[rgba(212,168,71,0.3)] rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[rgba(212,168,71,0.3)] rounded-br-lg" />

              <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[rgba(212,168,71,0.12)] flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7" style={{ color: "var(--gold)" }} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)] mb-3">{t("bookBadge")}</span>
                <h3 className="text-xl font-extrabold leading-tight mb-3 text-white">
                  {t("bookTitle1")}<br />{t("bookTitle2")}
                </h3>
                <p className="text-xs leading-relaxed text-white/70">
                  {t("bookSubtitle")}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[10px] text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                  <span>{t("bookMeta1")}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                  <span>{t("bookMeta2")}</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-3 -right-3 bg-[var(--gold)] text-black px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {t("free")}
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
              style={{ background: "rgba(212,168,71,0.08)", color: "var(--gold)", border: "1px solid rgba(212,168,71,0.2)" }}
            >
              {t("baixe")}
            </span>

            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-tight leading-tight mb-4">
              {t("title1")}<br />
              <span className="gradient-gold-text">{t("title2")}</span>
            </h2>

            <p className="text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0" style={{ color: "var(--text-secondary)" }}>
              {t("desc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((b) => (
                <div key={b.tKey} className="glass-card p-4 text-left">
                  <b.icon className="w-4 h-4 mb-2" style={{ color: "var(--gold)" }} />
                  <h4 className="text-sm font-bold mb-0.5">{t(b.tKey)}</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{t(b.dKey)}</p>
                </div>
              ))}
            </div>

            <Link
              href="/cadastro?ref=ebook"
              className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 text-sm font-bold hover:scale-105 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              {t("cta")}
            </Link>

            <p className="mt-3 text-[11px] text-[var(--text-muted)]">{t("after")}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}