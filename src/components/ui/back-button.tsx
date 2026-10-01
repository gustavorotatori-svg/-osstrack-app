"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useT } from "@/lib/use-t"

export function BackButton({ href, label }: { href: string; label?: string }) {
  const t = useT("shared")
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors mb-4"
    >
      <ChevronLeft className="w-4 h-4" />
      {label || t("voltar")}
    </Link>
  )
}
