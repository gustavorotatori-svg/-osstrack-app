import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (usuario.plano === "premium") {
    return NextResponse.json({ error: "Já é premium" }, { status: 400 })
  }

  if (usuario.stripeSubscriptionId) {
    return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/dashboard/aluno?premium=pending` })
  }

  try {
    const stripe = getStripe()
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ error: "Stripe não configurado" }, { status: 500 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: usuario.email,
      metadata: { usuarioId: usuario.id },
      subscription_data: {
        trial_period_days: 7,
      },
      payment_method_collection: "always",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/aluno?premium=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/aluno?premium=cancel`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 })
  }
}
