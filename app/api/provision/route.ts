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
 *  2. Update status → "provisioning"
 *  3. Create Composio entity
 *  4. Call provisionVPS() from lib/contabo.ts
 *  5. Store vps_instance_id + dashboard_url in Supabase
 *  6. Update status → "active", provisioned_at = now()
 *  7. Alert Pulkit on Telegram
 *  8. Send welcome email to user
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

// ─── Env helpers (lazy — avoid build-time errors) ───────────────────────

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

function envOpt(key: string): string | undefined {
  return process.env[key]
}

// ─── Telegram alert ──────────────────────────────────────────────────────

async function alertPulkit(html: string) {
  const botToken = envOpt('TELEGRAM_BOT_TOKEN')
  const chatId = envOpt('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) {
    console.warn('[Telegram alert skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set]')
    return
  }
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    console.error('[Telegram alert failed]', err)
  }
}

// ─── Welcome email ─────────────────────────────────────────────────────

async function sendWelcomeEmail(email: string, agentName: string, dashboardUrl: string) {
  // TODO: Wire up Resend/SendGrid once Pulkit provides keys
  console.log(`[welcome email] to=${email} agent=${agentName} dashboard=${dashboardUrl}`)
}

// ─── Core provisioning logic ──────────────────────────────────────────────

async function runProvisioning(params: {
  clerkUserId: string
  plan: 'personal' | 'team' | 'business' | 'enterprise'
}): Promise<{ success: true; dashboardUrl: string }> {
  const { clerkUserId, plan } = params

  // 1. Verify status = "paid"
  const row = await getOnboardingByUserId(clerkUserId)
  if (!row) throw new Error(`User not found: ${clerkUserId}`)
  if (row.status !== 'paid') {
    throw new Error(`User ${clerkUserId} status is "${row.status}", expected "paid"`)
  }

  // 2. Safety: no duplicate VPS
  const alreadyHasVPS = await checkUserHasVPS(clerkUserId)
  if (alreadyHasVPS) {
    throw new Error(`User ${clerkUserId} already has a VPS — skipping`)
  }

  // 3. Update status → "provisioning"
  await updateOnboardingStatus(clerkUserId, { status: 'provisioning' })

  try {
    // 4. Create Composio entity
    const composioApiKey = envOpt('COMPOSIO_API_KEY')
    let composioEntityId = clerkUserId
    if (composioApiKey) {
      await logProvisioningEvent({ userId: clerkUserId, action: 'create_composio_entity_start' })
      const res = await fetch('https://backend.composio.dev/v2/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': composioApiKey },
        body: JSON.stringify({ identifier: clerkUserId }),
      })
      if (res.ok) {
        const data = await res.json()
        composioEntityId = data?.data?.id ?? composioEntityId
      }
      await logProvisioningEvent({
        userId: clerkUserId,
        action: 'create_composio_entity_done',
        response: { composioEntityId },
      })
    }

    // 5. Provision VPS
    const vps = await provisionVPS({ userId: clerkUserId, plan })

    // 6. Build dashboard URL: {slug}.app.clawops.studio
    const businessName = row.business_name ?? 'client'
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
    const dashboardUrl = `https://${slug}.app.clawops.studio`

    // 7. Update Supabase
    await updateOnboardingStatus(clerkUserId, {
      status: 'active',
      composio_entity_id: composioEntityId,
      vps_instance_id: vps.instanceId,
      dashboard_url: dashboardUrl,
      provisioned_at: new Date().toISOString(),
    })

    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'provisioning_complete',
      payload: { composioEntityId, instanceId: vps.instanceId, dashboardUrl },
      response: { ip: vps.ipAddress, status: vps.status },
    })

    // 8. Alert Pulkit
    const agentName = row.agent_name ?? 'Your agent'
    const fullName = row.full_name ?? 'User'
    await alertPulkit(
      `✅ <b>Provisioning complete</b>\n\n` +
      `Name: ${fullName}\n` +
      `Plan: ${plan}\n` +
      `Agent: ${agentName}\n` +
      `Instance: ${vps.instanceId}\n` +
      `IP: ${vps.ipAddress}\n` +
      `Dashboard: ${dashboardUrl}`
    )

    // 9. Send welcome email
    if (row.email) {
      await sendWelcomeEmail(row.email, agentName, dashboardUrl)
    }

    return { success: true, dashboardUrl }

  } catch (err: any) {
    // Revert status so it can be retried
    await updateOnboardingStatus(clerkUserId, { status: 'paid' })
    await alertPulkit(`❌ <b>Provisioning failed</b>\n\nuser: ${clerkUserId}\nerror: ${err.message}`)
    throw err
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── MOCK_PAYMENT=true bypass ──────────────────────────────────────
  // For local/testing: POST { clerk_user_id, plan } directly without Stripe
  if (envOpt('MOCK_PAYMENT') === 'true') {
    const body = await req.json()
    const clerkUserId = body.clerk_user_id ?? body.clerkUserId
    const plan = (body.plan ?? 'personal') as 'personal' | 'team' | 'business' | 'enterprise'

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

  // ── Stripe webhook path ───────────────────────────────────────────
  const stripeSecretKey = envOpt('STRIPE_SECRET_KEY')
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured — set MOCK_PAYMENT=true for testing' },
      { status: 503 }
    )
  }

  // Lazy Stripe init
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

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as any
  const clerkUserId = session.metadata?.clerk_user_id ?? ''
  const plan = (session.metadata?.plan ?? 'personal') as 'personal' | 'team' | 'business' | 'enterprise'

  console.log(`[provision] Stripe webhook — user=${clerkUserId} plan=${plan}`)

  await logProvisioningEvent({
    userId: clerkUserId,
    action: 'webhook_received',
    payload: { eventType: event.type, sessionId: session.id },
  })

  try {
    const result = await runProvisioning({ clerkUserId, plan })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error(`[provision] Error for user=${clerkUserId}:`, err)
    await alertPulkit(`❌ <b>Provision error</b>\n\nuser: ${clerkUserId}\nerror: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
