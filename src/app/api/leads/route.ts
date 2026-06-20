import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function POST(req: Request) {
  try {
    const { nome, email, academia, telefone } = await req.json()

    if (!nome || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: { nome, email, academia, telefone },
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
