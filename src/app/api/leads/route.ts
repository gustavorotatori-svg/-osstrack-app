import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

const leadSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(120),
  email: z.string().email("E-mail inválido").max(255),
  academia: z.string().max(120).optional(),
  telefone: z.string().max(20).optional(),
  consentimento: z.boolean({ message: "Consentimento é obrigatório" }),
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")?.[0]?.trim() || "127.0.0.1"
    const rateCheck = await checkRateLimit(`ip:${ip}`, "leads")
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { nome, email, academia, telefone, consentimento } = parsed.data

    if (!consentimento) {
      return NextResponse.json(
        { error: "É necessário consentir com o tratamento dos seus dados (LGPD)" },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: { nome, email, academia, telefone, consentimento: true, consentimentoData: new Date() },
    })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [total, ultimos] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    ])

    return NextResponse.json({ total, leads: ultimos })
  } catch (error) {
    return handleApiError(error)
  }
}
