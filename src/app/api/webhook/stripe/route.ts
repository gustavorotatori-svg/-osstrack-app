import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") || ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("Stripe webhook signature error:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const stripe = getStripe()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any
      const usuarioId = session.metadata?.usuarioId
      if (!usuarioId) break

      const agora = new Date()
      const expiracao = new Date(agora)
      expiracao.setMonth(expiracao.getMonth() + 1)

      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          plano: "premium",
          planoInicio: agora,
          planoExpiracao: expiracao,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        },
      })

      await prisma.pagamento.create({
        data: {
          usuarioId,
          valor: 490,
          status: "confirmed",
          metodo: "stripe",
          stripeId: session.id,
          mesReferencia: agora.getMonth() + 1,
          anoReferencia: agora.getFullYear(),
        },
      })

      await prisma.notificacao.create({
        data: {
          usuarioId,
          tipo: "sistema",
          titulo: "Bem-vindo ao Premium!",
          descricao: "Sua assinatura foi ativada com sucesso. Aproveite! 🥋",
          link: "/dashboard/aluno/premium",
        },
      })
      break
    }

    case "invoice.paid": {
      const invoice = event.data.object as any
      const subscriptionId = invoice.subscription
      if (!subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
      const usuarioId = subscription.metadata?.usuarioId

      if (!usuarioId) {
        const customerId = invoice.customer
        const usuario = await prisma.usuario.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!usuario) break

        const expiracao = new Date(subscription.current_period_end * 1000)
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            plano: "premium",
            planoExpiracao: expiracao,
            stripeSubscriptionId: subscriptionId,
          },
        })

        await prisma.pagamento.create({
          data: {
            usuarioId: usuario.id,
            valor: 490,
            status: "confirmed",
            metodo: "stripe",
            stripeId: invoice.id,
            mesReferencia: new Date().getMonth() + 1,
            anoReferencia: new Date().getFullYear(),
          },
        })
      } else {
        const expiracao = new Date(subscription.current_period_end * 1000)
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: { planoExpiracao: expiracao },
        })

        await prisma.pagamento.create({
          data: {
            usuarioId,
            valor: 490,
            status: "confirmed",
            metodo: "stripe",
            stripeId: invoice.id,
            mesReferencia: new Date().getMonth() + 1,
            anoReferencia: new Date().getFullYear(),
          },
        })
      }
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as any
      const customerId = sub.customer
      const usuario = await prisma.usuario.findFirst({
        where: { stripeCustomerId: customerId },
      })
      if (usuario) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            plano: "free",
            planoInicio: null,
            planoExpiracao: null,
            stripeSubscriptionId: null,
          },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
