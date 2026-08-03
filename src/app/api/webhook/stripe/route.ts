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

      await prisma.premiumSubscription.upsert({
        where: { usuarioId },
        update: {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: "active",
          plan: "premium",
          currentPeriodStart: agora,
          currentPeriodEnd: expiracao,
        },
        create: {
          usuarioId,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: "active",
          plan: "premium",
          currentPeriodStart: agora,
          currentPeriodEnd: expiracao,
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

      if (usuarioId) {
        await prisma.premiumSubscription.upsert({
          where: { usuarioId },
          update: {
            status: "active",
            plan: "premium",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeSubscriptionId: subscriptionId,
          },
          create: {
            usuarioId,
            stripeSubscriptionId: subscriptionId,
            status: "active",
            plan: "premium",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
      } else {
        const customerId = invoice.customer
        const usuario = await prisma.usuario.findFirst({
          where: { premiumSubscription: { stripeCustomerId: customerId } },
        })
        if (!usuario) break

        await prisma.premiumSubscription.upsert({
          where: { usuarioId: usuario.id },
          update: {
            status: "active",
            plan: "premium",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          },
          create: {
            usuarioId: usuario.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: "active",
            plan: "premium",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
      }
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as any
      const customerId = sub.customer
      const usuario = await prisma.usuario.findFirst({
        where: { premiumSubscription: { stripeCustomerId: customerId } },
      })
      if (usuario) {
        await prisma.premiumSubscription.update({
          where: { usuarioId: usuario.id },
          data: { status: "canceled" },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
