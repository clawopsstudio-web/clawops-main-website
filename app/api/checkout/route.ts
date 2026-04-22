/**
 * app/api/checkout/route.ts — Create Stripe checkout session
 *
 * Called from Step 5 of /start form.
 * Accepts: POST { clerk_user_id, plan, email }
 * Returns: { checkout_url: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

const PRICE_IDS: Record<string, string | undefined> = {
  personal: process.env.STRIPE_PRICE_ID_PERSONAL,
  team: process.env.STRIPE_PRICE_ID_TEAM,
  business: process.env.STRIPE_PRICE_ID_BUSINESS,
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clerk_user_id, plan = 'personal', email } = body

  if (!clerk_user_id) {
    return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
  }

  // Use price ID for the plan
  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price ID for plan: ${plan}` }, { status: 400 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(env('STRIPE_SECRET_KEY'))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.clawops.studio'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email ?? undefined,
    metadata: {
      clerk_user_id,
      plan,
    },
    success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/start?step=5`,
  })

  // Log to Supabase
  await supabaseAdmin
    .from('provisioning_logs')
    .insert({
      user_id: clerk_user_id,
      action: 'checkout_session_created',
      payload: { plan, email },
      response: { session_id: session.id },
      status: 'pending',
    })

  return NextResponse.json({ checkout_url: session.url })
}
