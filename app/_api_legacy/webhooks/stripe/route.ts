/**
 * app/api/webhooks/stripe/route.ts — Stripe webhook handler
 *
 * Verifies Stripe signature on every request.
 * Forwards to provision-orchestrator for provisioning.
 *
 * Handles:
 *   - checkout.session.completed → trigger provisioning
 *   - customer.subscription.updated → update plan
 *   - customer.subscription.deleted → suspend VPS
 *   - invoice.payment_failed → alert Pulkit
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOnboardingByUserId, updateOnboardingStatus, logProvisioningEvent } from '@/lib/supabase-admin'
import { runProvisioning } from '@/lib/provision-orchestrator'
import type { Plan } from '@/lib/provision-orchestrator'

function envOpt(key: string): string | undefined {
  return process.env[key]
}

async function alertPulkit(html: string) {
  const botToken = envOpt('TELEGRAM_BOT_TOKEN')
  const chatId = envOpt('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) return
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
    console.error(`Stripe webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── checkout.session.completed ──────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const clerkUserId = session.metadata?.clerkUserId ?? ''
    const plan = (session.metadata?.plan ?? 'personal') as Plan

    if (!clerkUserId) {
      console.error('[stripe-webhook] No clerkUserId in metadata')
      return NextResponse.json({ error: 'Missing clerkUserId in metadata' }, { status: 400 })
    }

    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'webhook_checkout_completed',
      payload: { eventType: event.type, sessionId: session.id, plan },
    })

    // Idempotency
    const row = await getOnboardingByUserId(clerkUserId)
    if (row?.status === 'active') {
      console.log(`[stripe-webhook] User ${clerkUserId} already active — skipping`)
      return NextResponse.json({ skipped: true, reason: 'already_active' })
    }

    // Update payment_status = 'paid'
    await supabaseAdmin
      .from('onboarding_submissions')
      .update({
        payment_status: 'paid',
        stripe_session_id: session.id,
      })
      .eq('clerk_user_id', clerkUserId)

    try {
      await runProvisioning({ clerkUserId, plan })
    } catch (err: any) {
      console.error(`[stripe-webhook] Provisioning failed for ${clerkUserId}:`, err.message)
      await alertPulkit(
        `🚨 <b>Provision failed after payment</b>\n\nuser: ${clerkUserId}\nplan: ${plan}\nerror: ${err.message}`
      )
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    return NextResponse.json({ received: true, action: 'checkout_completed_provisioned' })
  }

  // ── customer.subscription.updated ───────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any
    const clerkUserId = subscription.metadata?.clerkUserId ?? ''
    const newPlan = (subscription.metadata?.plan ?? 'personal') as Plan

    if (clerkUserId) {
      await Promise.all([
        supabaseAdmin.from('profiles').update({
          plan: newPlan,
          updated_at: new Date().toISOString(),
        }).eq('id', clerkUserId),
        supabaseAdmin.from('onboarding_submissions').update({
          plan: newPlan,
        }).eq('clerk_user_id', clerkUserId),
      ])

      await logProvisioningEvent({
        userId: clerkUserId,
        action: 'subscription_updated',
        payload: { plan: newPlan },
      })
    }

    return NextResponse.json({ received: true, action: 'subscription_updated' })
  }

  // ── customer.subscription.deleted ───────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const clerkUserId = subscription.metadata?.clerkUserId ?? ''
    const email = subscription.metadata?.email ?? clerkUserId

    if (clerkUserId) {
      // Suspend — do NOT delete VPS
      await updateOnboardingStatus(clerkUserId, { status: 'suspended' })

      await logProvisioningEvent({
        userId: clerkUserId,
        action: 'subscription_cancelled',
        payload: { status: 'suspended' },
      })

      await alertPulkit(`📛 <b>Subscription cancelled:</b> ${email}`)
    }

    return NextResponse.json({ received: true, action: 'subscription_deleted_suspended' })
  }

  // ── invoice.payment_failed ──────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    const clerkUserId = invoice.metadata?.clerkUserId ?? ''
    const email = invoice.metadata?.email ?? clerkUserId

    if (clerkUserId) {
      await supabaseAdmin
        .from('onboarding_submissions')
        .update({ payment_status: 'failed' })
        .eq('clerk_user_id', clerkUserId)

      await alertPulkit(`⚠️ <b>Payment failed for</b> ${email}`)
    }

    return NextResponse.json({ received: true, action: 'payment_failed' })
  }

  return NextResponse.json({ received: true })
}
