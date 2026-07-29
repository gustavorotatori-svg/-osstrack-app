import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { rankingConfigSchema } from "@/lib/validation"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const academia = await prisma.academia.findUnique({
    where: { id: session.user.academiaId },
    select: { rankingVisivel: true },
  })

  return NextResponse.json({ rankingVisivel: academia?.rankingVisivel ?? true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = rankingConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "rankingVisivel é obrigatório" }, { status: 400 })
  }
  const { rankingVisivel } = parsed.data

  await prisma.academia.update({
    where: { id: session.user.academiaId },
    data: { rankingVisivel },
  })

  return NextResponse.json({ rankingVisivel })
  } catch (error) {
    return handleApiError(error)
  }
}
