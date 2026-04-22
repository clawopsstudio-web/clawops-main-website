/**
 * app/api/webhooks/stripe/route.ts — Stripe webhook handler
 *
 * MASTER TRIGGER for Phase 2 provisioning pipeline.
 * Nothing runs without this.
 *
 * Strict order:
 *  1. Verify Stripe signature
 *  2. Handle only checkout.session.completed
 *  3. Extract clerk_user_id from metadata
 *  4. Update Supabase: status=paid, paid_at=now()
 *  5. Call /api/provision (async)
 *  6. Return 200 fast (Stripe needs <30s response)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function envOpt(key: string): string | undefined {
  return process.env[key]
}

export async function POST(req: NextRequest) {
  // ── MOCK_PAYMENT bypass (for local/testing) ────────────────────────────
  if (envOpt('MOCK_PAYMENT') === 'true') {
    const body = await req.json()
    const clerkUserId = body.clerk_user_id ?? body.clerkUserId
    const plan = body.plan ?? 'personal'

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
    }

    // Mark as paid
    await supabaseAdmin
      .from('onboarding_submissions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('clerk_user_id', clerkUserId)

    // Trigger provisioning async
    fetch(`${req.nextUrl.origin}/api/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerk_user_id: clerkUserId, plan }),
    }).catch(err => console.error('[webhook/mock] provision trigger failed:', err))

    return NextResponse.json({ received: true, mock: true })
  }

  // ── Real Stripe webhook path ─────────────────────────────────────────
  const stripeSecretKey = envOpt('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 503 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(stripeSecretKey)

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = envOpt('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: any
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('[stripe/webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as any
  const clerkUserId = session.metadata?.clerk_user_id
  const plan = session.metadata?.plan ?? 'personal'

  if (!clerkUserId) {
    console.error('[stripe/webhook] missing clerk_user_id in session metadata')
    return NextResponse.json({ error: 'Missing clerk_user_id' }, { status: 400 })
  }

  // Update Supabase: mark as paid
  await supabaseAdmin
    .from('onboarding_submissions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('clerk_user_id', clerkUserId)

  console.log(`[stripe/webhook] Payment confirmed for ${clerkUserId} — triggering provision`)

  // Trigger provisioning async — don't await
  fetch(`${req.nextUrl.origin}/api/provision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clerk_user_id: clerkUserId, plan }),
  }).catch(err => console.error('[stripe/webhook] provision trigger failed:', err))

  // Return 200 immediately — Stripe retries if we don't
  return NextResponse.json({ received: true })
}
