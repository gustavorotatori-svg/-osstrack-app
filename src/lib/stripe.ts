import Stripe from "stripe"

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada")
  return new Stripe(key)
}

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || ""

export async function createCheckoutSession(params: {
  usuarioId: string
  email: string
  academiaId?: string | null
}) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    customer_email: params.email,
    metadata: { usuarioId: params.usuarioId },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/aluno?premium=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cadastro?cancelado=1`,
  })
  return session
}
