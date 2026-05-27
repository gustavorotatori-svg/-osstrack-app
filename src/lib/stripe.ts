import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "price_placeholder"

export async function createCheckoutSession(params: {
  usuarioId: string
  email: string
  nome: string
  academiaId?: string | null
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    customer_email: params.email,
    metadata: { usuarioId: params.usuarioId, academiaId: params.academiaId || "" },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/aluno?premium=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cadastro?cancelado=1`,
  })
  return session
}
