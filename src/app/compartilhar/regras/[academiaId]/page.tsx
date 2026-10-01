import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { RegrasView } from "./client"

const beltOrder = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export default async function CompartilharRegrasPage({ params }: { params: Promise<{ academiaId: string }> }) {
  const { academiaId } = await params

  const academia = await prisma.academia.findUnique({ where: { id: academiaId } })
  if (!academia) notFound()

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId, categoria: "adulto" },
    orderBy: { aulasProxFx: "asc" },
  })

  const sorted = graduacoes.sort(
    (a, b) => beltOrder.indexOf(a.faixa) - beltOrder.indexOf(b.faixa)
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://osstrack.com.br"

  return (
    <RegrasView
      nome={academia.nome}
      cidade={academia.cidade}
      estado={academia.estado}
      graduacoes={sorted.map((g) => ({
        id: g.id,
        faixa: g.faixa,
        graus: g.graus,
        aulasPorGrau: g.aulasPorGrau,
        aulasProxFx: g.aulasProxFx,
        aulasMinimasAno: g.aulasMinimasAno,
        dataProva: g.dataProva ? g.dataProva.toISOString() : null,
        regraTroca: g.regraTroca,
      }))}
      cadastroHref={`${baseUrl}/cadastro?academiaId=${academiaId}&academia=${encodeURIComponent(academia.nome)}`}
    />
  )
}
