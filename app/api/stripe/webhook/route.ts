// app/api/stripe/webhook/route.ts
// Handles Stripe events: checkout completed, subscription cancelled, etc.

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkId = session.metadata?.clerkId
      if (!clerkId) break

      await db.user.update({
        where: { clerkId },
        data: { plan: 'PRO' },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const clerkId = sub.metadata?.clerkId
      if (!clerkId) break

      await db.user.update({
        where: { clerkId },
        data: { plan: 'FREE' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}

// ─── Create checkout session ───────────────────────────────────────
// POST /api/stripe/checkout  { clerkId, email }
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  const { userId: clerkId } = auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: user?.email ?? undefined,
    metadata: { clerkId },
    line_items: [{
      price: process.env.STRIPE_PRO_PRICE_ID!,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
