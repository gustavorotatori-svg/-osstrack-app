"use client"

import { useState, useEffect } from "react"
import { GiftIcon } from "@/components/ui/icons"
import { getBeltColor } from "@/lib/utils"

type Aniversariante = {
  id: string
  nome: string
  faixa: string
  avatar: string | null
  dia: number
}

export function BirthdaysCard() {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/aniversariantes")
      .then((r) => r.json())
      .then((d) => { setAniversariantes(d.aniversariantes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading || aniversariantes.length === 0) return null

  const nomeMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][new Date().getMonth()]

  return (
    <div className="glass-card-accent p-5" style={{"--accent-color": "var(--belt-vermelha)"} as React.CSSProperties}>
      <div className="flex items-center gap-2 mb-3">
        <GiftIcon className="w-5 h-5 text-pink-400" />
        <span className="section-header mb-0">Aniversariantes de {nomeMes}</span>
        <span className="badge ml-auto">{aniversariantes.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {aniversariantes.map((a) => (
          <div
            key={a.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-xs font-bold text-pink-400">{a.dia}</span>
            <span className="text-sm font-semibold">{a.nome}</span>
            <span className={`text-[10px] font-semibold ${getBeltColor(a.faixa)}`}>{a.faixa}</span>
          </div>
        ))}
      </div>
    </div>
  )
}