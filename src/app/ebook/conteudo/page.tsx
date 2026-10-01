"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Printer } from "lucide-react"
import { useT } from "@/lib/use-t"

export default function EbookConteudo() {
  const { status } = useSession()
  const router = useRouter()
  const t = useT("ebookContent")

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
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("gate")}</p>
          <Link href="/cadastro?ref=ebook" className="inline-block px-6 py-3 rounded-xl text-sm font-bold btn-gold">
            {t("gateCta")}
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
            <ArrowLeft className="w-3 h-3" /> {t("voltar")}
          </Link>
          <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>{t("topoEbook")}</span>
          <button
            onClick={() => window.print()}
            className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}
          >
            <Printer className="w-3 h-3" /> {t("pdf")}
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
            {t("badge")}
          </span>
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight leading-tight mt-3 mb-3">
            {t("titulo1")}<br />
            <span className="gradient-gold-text">{t("titulo2")}</span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t("subtitulo")}
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
          <Section title={t("s1")}>
            <p>{t("corpo.s1p1")}</p>
            <p>
              {t("corpo.s1p2a")}<strong>{t("corpo.s1p2Strong")}</strong>{t("corpo.s1p2b")}
            </p>
            <p>
              {t("corpo.s1p3a")}<strong>{t("corpo.s1p3Strong")}</strong>{t("corpo.s1p3b")}
            </p>
            <p className="p-4 rounded-xl font-semibold text-sm" style={{ background: "rgba(212,168,71,0.06)", borderLeft: "3px solid var(--gold)", color: "var(--gold)" }}>
              {t("corpo.s1Tip")}
            </p>
          </Section>

          <Section title={t("s2")}>
            <p>{t("corpo.s2Intro")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s2a")}</p>
            <p>{t("corpo.s2aBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s2b")}</p>
            <p>{t("corpo.s2bBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s2c")}</p>
            <p>{t("corpo.s2cBody")}</p>
          </Section>

          <Section title={t("s3")}>
            <p>{t("corpo.s3Intro")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s3a")}</p>
            <p>{t("corpo.s3aBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s3b")}</p>
            <p>{t("corpo.s3bBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s3c")}</p>
            <p>{t("corpo.s3cBody")}</p>

            <p className="p-4 rounded-xl font-semibold text-sm mt-3" style={{ background: "rgba(212,168,71,0.06)", borderLeft: "3px solid var(--gold)", color: "var(--gold)" }}>
              {t("corpo.s3Tip")}
            </p>
          </Section>

          <Section title={t("s4")}>
            <p>{t("corpo.s4Intro")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s4a")}</p>
            <p>{t("corpo.s4aBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s4b")}</p>
            <p>{t("corpo.s4bBody")}</p>

            <p className="font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{t("s4c")}</p>
            <p>{t("corpo.s4cBody")}</p>
          </Section>

          <Section title={t("s5")}>
            <p>{t("corpo.s5Intro")}</p>

            <ul className="space-y-3 pl-5">
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>{t("corpo.s5i1Label")}</strong> {t("corpo.s5i1Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>{t("corpo.s5i2Label")}</strong> {t("corpo.s5i2Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>{t("corpo.s5i3Label")}</strong> {t("corpo.s5i3Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                📱 <span><strong>{t("corpo.s5i4Label")}</strong> {t("corpo.s5i4Text")}</span>
              </li>
            </ul>
          </Section>

          <Section title={t("s6")}>
            <p>
              {t("corpo.s6IntroA")}<strong>{t("corpo.s6IntroStrong")}</strong>{t("corpo.s6IntroB")}
            </p>

            <ul className="space-y-3 pl-5">
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>{t("corpo.s6i1Label")}</strong> {t("corpo.s6i1Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>{t("corpo.s6i2Label")}</strong> {t("corpo.s6i2Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>{t("corpo.s6i3Label")}</strong> {t("corpo.s6i3Text")}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                🎉 <span><strong>{t("corpo.s6i4Label")}</strong> {t("corpo.s6i4Text")}</span>
              </li>
            </ul>
          </Section>

          <Section title={t("s7")}>
            <p>{t("corpo.s7Intro")}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--text-primary)" }}>{t("tabela.metrica")}</th>
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--gold)" }}>{t("tabela.revela")}</th>
                    <th className="text-left py-3 px-3 font-bold" style={{ color: "var(--gold)" }}>{t("tabela.meta")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr><td className="py-2.5 px-3">{t("corpo.tabela.f1")}</td><td className="py-2.5 px-3">{t("corpo.tabela.r1")}</td><td className="py-2.5 px-3">{t("corpo.tabela.m1")}</td></tr>
                  <tr><td className="py-2.5 px-3">{t("corpo.tabela.f2")}</td><td className="py-2.5 px-3">{t("corpo.tabela.r2")}</td><td className="py-2.5 px-3">{t("corpo.tabela.m2")}</td></tr>
                  <tr><td className="py-2.5 px-3">{t("corpo.tabela.f3")}</td><td className="py-2.5 px-3">{t("corpo.tabela.r3")}</td><td className="py-2.5 px-3">{t("corpo.tabela.m3")}</td></tr>
                  <tr><td className="py-2.5 px-3">{t("corpo.tabela.f4")}</td><td className="py-2.5 px-3">{t("corpo.tabela.r4")}</td><td className="py-2.5 px-3">{t("corpo.tabela.m4")}</td></tr>
                  <tr><td className="py-2.5 px-3">{t("corpo.tabela.f5")}</td><td className="py-2.5 px-3">{t("corpo.tabela.r5")}</td><td className="py-2.5 px-3">{t("corpo.tabela.m5")}</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-3">{t("corpo.s7Outro")}</p>
          </Section>

          <Section title={t("s8")}>
            <p>{t("corpo.s8Intro")}</p>

            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>{t("corpo.s8i1Label")}</strong> {t("corpo.s8i1Text")}</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>{t("corpo.s8i2Label")}</strong> {t("corpo.s8i2Text")}</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>{t("corpo.s8i3Label")}</strong> {t("corpo.s8i3Text")}</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>{t("corpo.s8i4Label")}</strong> {t("corpo.s8i4Text")}</span></li>
              <li className="flex items-start gap-2 text-sm">✅ <span><strong>{t("corpo.s8i5Label")}</strong> {t("corpo.s8i5Text")}</span></li>
            </ul>

            <div className="mt-4 p-4 rounded-xl text-center" style={{ background: "rgba(212,168,71,0.06)", border: "1px solid rgba(212,168,71,0.15)" }}>
              <p className="font-semibold text-sm mb-3">{t("ctaTitulo")}</p>
              <Link
                href="/cadastro?ref=ebook"
                className="btn-gold px-6 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
              >
                {t("cta")}
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
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("rodape")}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{t("home")}</Link>
            <Link href="/cadastro?ref=ebook" className="text-xs font-medium" style={{ color: "var(--gold)" }}>{t("criarConta")}</Link>
          </div>
          <button
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(212,168,71,0.08)", color: "var(--gold)", border: "1px solid rgba(212,168,71,0.15)" }}
          >
            <Download className="w-3.5 h-3.5" /> {t("salvarPdf")}
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
