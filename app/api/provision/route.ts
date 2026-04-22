/**
 * app/api/provision/route.ts — Internal provisioning pipeline
 *
 * Triggered by:
 *   - Stripe webhook: POST /api/provision (checkout.session.completed)
 *   - MOCK_PAYMENT=true for local testing (no Stripe needed)
 *
 * NEVER call this directly from client code.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runProvisioning } from '@/lib/provision-orchestrator'
import { supabaseAdmin, getOnboardingByUserId, logProvisioningEvent } from '@/lib/supabase-admin'
import type { Plan } from '@/lib/provision-orchestrator'

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

function envOpt(key: string): string | undefined {
  return process.env[key]
}

async function alertPulkit(html: string) {
  const botToken = envOpt('TELEGRAM_BOT_TOKEN')
  const chatId = envOpt('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) {
    console.warn('[alertPulkit] Telegram token or chatId missing, skipping')
    return
  }
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: 'HTML' }),
    })
  } catch (err) {
    console.error('[Telegram alert failed]', err)
  }
}

export async function POST(req: NextRequest) {
  // ── MOCK_PAYMENT=true bypass ───────────────────────────
  if (envOpt('MOCK_PAYMENT') === 'true') {
    const body = await req.json()
    const clerkUserId = body.clerkUserId ?? body.clerk_user_id
    const plan = (body.plan ?? 'personal') as Plan

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
    }

    try {
      const result = await runProvisioning({ clerkUserId, plan })
      return NextResponse.json(result)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // ── Stripe webhook path ───────────────────────────────
  const stripeSecretKey = envOpt('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 503 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(stripeSecretKey)

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = envOpt('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as any
  const clerkUserId = session.metadata?.clerkUserId ?? ''
  const plan = (session.metadata?.plan ?? 'personal') as Plan

  if (!clerkUserId) {
    return NextResponse.json({ error: 'Missing clerkUserId in metadata' }, { status: 400 })
  }

  // Idempotency
  const row = await getOnboardingByUserId(clerkUserId)
  if (row?.status === 'active') {
    return NextResponse.json({ skipped: true, reason: 'already_active' })
  }

  // Update payment_status = 'paid'
  await supabaseAdmin
    .from('onboarding_submissions')
    .update({ payment_status: 'paid', stripe_session_id: session.id })
    .eq('clerk_user_id', clerkUserId)

  await logProvisioningEvent({
    userId: clerkUserId,
    action: 'webhook_checkout_completed',
    payload: { sessionId: session.id, plan },
  })

  try {
    const result = await runProvisioning({ clerkUserId, plan })
    return NextResponse.json(result)
  } catch (err: any) {
    await alertPulkit(
      `🚨 <b>Provision failed after payment</b>\n\nuser: ${clerkUserId}\nplan: ${plan}\nerror: ${err.message}`
    )
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
