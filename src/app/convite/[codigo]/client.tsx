"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"

export type TipoConvite = "invalido" | "usado" | "expirado"

export function ConviteCard({ tipo, emoji, href }: { tipo: TipoConvite; emoji: string; href: string }) {
  const t = useT("pagConvite")

  return (
    <main className="tatame-bg min-h-screen flex items-center justify-center p-5">
      <div className="glass-card max-w-md w-full p-8 text-center">
        <div className="text-4xl mb-4">{emoji}</div>
        <h1 className="text-xl font-black tracking-tight mb-2">{t(`${tipo}Titulo`)}</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          {t(`${tipo}Desc`)}
        </p>
        <Link href={href} className="btn-gold px-6 py-3 text-sm font-bold inline-block">
          {tipo === "usado" ? t("fazerLogin") : t("criarConta")}
        </Link>
        <div className="mt-4">
          <Link href="/" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            {t("voltarInicio")}
          </Link>
        </div>
      </div>
    </main>
  )
}
