/**
 * app/api/provision/route.ts — Internal provisioning pipeline
 *
 * Triggered by:
 *   - Stripe webhook: POST /api/provision (checkout.session.completed)
 *   - MOCK_PAYMENT=true for local testing (no Stripe needed)
 *
 * NEVER call this directly from client code.
 *
 * Strict order:
 *  1. Verify status = "paid" in Supabase
 *  2. Telegram alert: payment confirmed
 *  3. Update status → "provisioning"
 *  4. Create Composio entity + activate paid plan if team/business
 *  5. Call provisionVPS() from lib/contabo.ts
 *  6. Telegram alert: VPS live
 *  7. Store vps_instance_id + dashboard_url in Supabase
 *  8. Telegram alert: fully ready
 *  9. Send welcome email to user
 *
 * On failure at any step: Telegram alert (failure), revert status.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  supabaseAdmin,
  getOnboardingByUserId,
  updateOnboardingStatus,
  checkUserHasVPS,
  logProvisioningEvent,
} from '@/lib/supabase-admin'
import { provisionVPS } from '@/lib/contabo'
import { createUserSession, activateComposioPaidPlan } from '@/lib/composio'

type Plan = 'personal' | 'team' | 'business'

// ─── Env helpers ────────────────────────────────────────────────────────

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

function envOpt(key: string): string | undefined {
  return process.env[key]
}

// ─── Telegram alerts (4 points) ───────────────────────────────────────

async function alertPulkit(html: string) {
  const botToken = envOpt('TELEGRAM_BOT_TOKEN')
  const chatId = envOpt('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) {
    console.warn('[Telegram] Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
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

const Telegram = {
  paymentConfirmed: (email: string, plan: Plan) =>
    `💳 <b>New payment received</b>\n\nUser: ${email}\nPlan: ${plan}\nStarting provisioning now...`,

  vpsLive: (email: string, ip: string, slug: string) =>
    `✅ <b>VPS provisioned</b>\n\nUser: ${email}\nIP: ${ip}\nURL: ${slug}.app.clawops.studio\nInstalling Hermes...`,

  fullyReady: (email: string, slug: string, plan: Plan) =>
    `🚀 <b>${email} is LIVE</b>\n\nDashboard: ${slug}.app.clawops.studio\nPlan: ${plan}\nAll systems running.`,

  failure: (email: string, step: string, error: string) =>
    `🚨 <b>PROVISIONING FAILED</b>\n\nUser: ${email}\nStep: ${step}\nError: ${error}\nManual intervention required.`,
}

// ─── Welcome email (placeholder) ───────────────────────────────────────

async function sendWelcomeEmail(email: string, agentName: string, dashboardUrl: string) {
  console.log(`[welcome email] to=${email} agent=${agentName} dashboard=${dashboardUrl}`)
}

// ─── Generate slug from business name ──────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || `client-${Date.now().toString(36)}`
}

// ─── Core provisioning logic ────────────────────────────────────────────

async function runProvisioning(params: {
  clerkUserId: string
  plan: Plan
}): Promise<{ success: true; dashboardUrl: string }> {
  const { clerkUserId, plan } = params

  // 1. Fetch user row
  const row = await getOnboardingByUserId(clerkUserId)
  if (!row) throw new Error(`User not found: ${clerkUserId}`)
  const email = row.email ?? 'unknown'

  // 2. Verify status = "paid"
  if (row.status !== 'paid') {
    throw new Error(`User ${clerkUserId} status is "${row.status}", expected "paid"`)
  }

  // 3. Safety: no duplicate VPS
  const alreadyHasVPS = await checkUserHasVPS(clerkUserId)
  if (alreadyHasVPS) {
    throw new Error(`User ${clerkUserId} already has a VPS — skipping`)
  }

  // 4. Telegram POINT 1 — payment confirmed
  await alertPulkit(Telegram.paymentConfirmed(email, plan))

  // 5. Update status → "provisioning"
  await updateOnboardingStatus(clerkUserId, { status: 'provisioning' })

  try {
    // 6. Create Composio entity + session
    try {
      await logProvisioningEvent({ userId: clerkUserId, action: 'create_composio_entity_start' })
      await createUserSession(clerkUserId, ['GMAIL', 'SLACK', 'TELEGRAM'])
      await logProvisioningEvent({ userId: clerkUserId, action: 'create_composio_entity_done' })
    } catch (composioErr: any) {
      console.error('[provision] Composio entity error (non-fatal):', composioErr.message)
      // Continue — VPS provisioning is more important
    }

    // 7. Activate paid Composio plan for team/business
    if (plan === 'team' || plan === 'business') {
      try {
        await logProvisioningEvent({ userId: clerkUserId, action: 'composio_paid_plan_start' })
        await activateComposioPaidPlan(clerkUserId)
        await logProvisioningEvent({ userId: clerkUserId, action: 'composio_paid_plan_done' })
      } catch (planErr: any) {
        console.error('[provision] Composio paid plan activation (non-fatal):', planErr.message)
      }
    }

    // 8. Provision VPS
    const vps = await provisionVPS({ userId: clerkUserId, plan })

    // 9. Telegram POINT 2 — VPS live
    const slug = slugify(row.business_name ?? 'client')
    await alertPulkit(Telegram.vpsLive(email, vps.ipAddress, slug))

    // 10. Update Supabase with full details
    const dashboardUrl = `https://${slug}.app.clawops.studio`
    await updateOnboardingStatus(clerkUserId, {
      status: 'active',
      vps_instance_id: vps.instanceId,
      dashboard_url: dashboardUrl,
      provisioned_at: new Date().toISOString(),
      composio_entity_created: true,
    })

    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'provisioning_complete',
      payload: { instanceId: vps.instanceId, dashboardUrl, ip: vps.ipAddress },
      response: { ip: vps.ipAddress, status: vps.status },
    })

    // 11. Telegram POINT 3 — fully ready
    await alertPulkit(Telegram.fullyReady(email, slug, plan))

    // 12. Send welcome email
    if (row.email) {
      await sendWelcomeEmail(row.email, row.agent_name ?? 'Your agent', dashboardUrl)
    }

    return { success: true, dashboardUrl }

  } catch (err: any) {
    // POINT 4 — failure
    await alertPulkit(Telegram.failure(email, 'provisioning', err.message))

    // Revert status so it can be retried
    await updateOnboardingStatus(clerkUserId, { status: 'paid' })
    throw err
  }
}

// ─── POST handler ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── MOCK_PAYMENT=true bypass ────────────────────────────────────
  if (envOpt('MOCK_PAYMENT') === 'true') {
    const body = await req.json()
    const clerkUserId = body.clerk_user_id ?? body.clerkUserId
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

  // ── Stripe webhook path ─────────────────────────────────────────
  const stripeSecretKey = envOpt('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured' },
      { status: 503 }
    )
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

  const session = event.data.object as any
  const clerkUserId = session.metadata?.clerk_user_id ?? ''
  const plan = (session.metadata?.plan ?? 'personal') as Plan

  console.log(`[provision] webhook — user=${clerkUserId} plan=${plan} type=${event.type}`)

  // Handle different Stripe events
  if (event.type === 'checkout.session.completed') {
    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'webhook_checkout_completed',
      payload: { sessionId: session.id },
    })

    // Idempotency: skip if already active
    const row = await getOnboardingByUserId(clerkUserId)
    if (row?.status === 'active') {
      console.log(`[provision] User ${clerkUserId} already active — skipping duplicate webhook`)
      return NextResponse.json({ skipped: true, reason: 'already_active' })
    }

    try {
      const result = await runProvisioning({ clerkUserId, plan })
      return NextResponse.json(result)
    } catch (err: any) {
      await alertPulkit(Telegram.failure(clerkUserId, 'webhook_processing', err.message))
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const newPlan = (session.metadata?.plan ?? 'personal') as Plan
    await supabaseAdmin
      .from('profiles')
      .update({ plan: newPlan, updated_at: new Date().toISOString() })
      .eq('id', clerkUserId)
    return NextResponse.json({ received: true, action: 'subscription_updated' })
  }

  if (event.type === 'customer.subscription.deleted') {
    await updateOnboardingStatus(clerkUserId, { status: 'suspended' })
    await alertPulkit(
      `📛 <b>Subscription cancelled:</b> ${session.metadata?.email ?? clerkUserId}`
    )
    return NextResponse.json({ received: true, action: 'subscription_deleted' })
  }

  if (event.type === 'invoice.payment_failed') {
    await updateOnboardingStatus(clerkUserId, { payment_status: 'failed' })
    await alertPulkit(
      `⚠️ <b>Payment failed for</b> ${session.metadata?.email ?? clerkUserId}`
    )
    return NextResponse.json({ received: true, action: 'payment_failed' })
  }

  return NextResponse.json({ received: true })
}
