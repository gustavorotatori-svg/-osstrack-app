"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"
import { ArrowLeft } from "lucide-react"
import { LockIcon } from "@/components/ui/icons"

const NUM_SECOES = 10

export function LgpdView() {
  const t = useT("pagLgpd")

  return (
    <div className="pt-28 pb-20 px-5">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {t("voltaInicio")}
        </Link>
        <div className="text-center mb-12">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4"><LockIcon className="w-6 h-6 text-black" /></div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">{t("titulo")}</h1>
          <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
            {t("subtitulo")}
          </p>
          <div className="text-xs text-[var(--gray)] mt-2">{t("atualizado")}</div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: NUM_SECOES }, (_, i) => {
            const n = i + 1
            return (
              <div key={n} className="glass-card p-6 md:p-8">
                <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t(`s${n}t`)}</h2>
                <p className="text-sm text-[var(--white-muted)] leading-relaxed">{t(`s${n}b`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
