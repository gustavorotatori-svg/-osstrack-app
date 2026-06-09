import { NextResponse } from "next/server"

export function handleApiError(error: unknown, context?: string) {
  console.error(`[API]${context ? ` ${context}` : ""}:`, error)

  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string }
    if (prismaError.code === "P2002") return NextResponse.json({ error: "Registro duplicado" }, { status: 409 })
    if (prismaError.code === "P2025") return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
    if (prismaError.code === "P2003") return NextResponse.json({ error: "Registro relacionado não encontrado" }, { status: 400 })
  }

  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
}
