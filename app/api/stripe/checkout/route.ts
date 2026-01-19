import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

// POST { type: 'daily' | 'occasion' | 'subscription', amount_gbp?: number, price_id?: string, successUrl, cancelUrl, metadata?: {} }
export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const type = payload.type as 'daily' | 'occasion' | 'subscription'
    const successUrl = payload.successUrl as string
    const cancelUrl = payload.cancelUrl as string
    const metadata = (payload.metadata || {}) as Record<string, string>

    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 })
    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'successUrl/cancelUrl required' }, { status: 400 })
    }

    if (type === 'subscription') {
      const priceId = payload.price_id as string
      if (!priceId) return NextResponse.json({ error: 'price_id required for subscription' }, { status: 400 })

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      })
      return NextResponse.json({ url: session.url })
    }

    // one-time payments (daily or occasion)
    const amountGbp = Number(payload.amount_gbp || 0)
    if (!Number.isFinite(amountGbp) || amountGbp <= 0) {
      return NextResponse.json({ error: 'amount_gbp must be > 0' }, { status: 400 })
    }

    const amount = Math.round(amountGbp * 100)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: type === 'occasion' ? 'Desi Occasions deposit' : 'Desi Occasions order' },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Stripe error' }, { status: 500 })
  }
}
