/**
 * app/api/provision/route.ts — Internal provisioning pipeline
 *
 * Triggered ONLY by Stripe webhook (checkout.session.completed)
 * NEVER call this directly from client code.
 *
 * Strict order:
 *  1. Verify status = "paid" in Supabase
 *  2. Update status → "provisioning"
 *  3. Create Composio entity (stored as composio_entity_id)
 *  4. Call provisionVPS() from lib/contabo.ts
 *  5. Update Supabase with vps_instance_id, dashboard_url
 *  6. Update status → "active", provisioned_at = now()
 *  7. Alert Pulkit on Telegram
 *  8. Send welcome email to user
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  supabaseAdmin,
  getOnboardingByUserId,
  updateOnboardingStatus,
  checkUserHasVPS,
  logProvisioningEvent,
} from '@/lib/supabase-admin'
import { provisionVPS } from '@/lib/contabo'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://clawops.studio'

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set')
    _stripe = new Stripe(STRIPE_SECRET_KEY)
  }
  return _stripe
}

// ─── Telegram alert ──────────────────────────────────────────────────────

async function alertPulkit(message: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `⚡ ClawOps Alert\n\n${message}`,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    console.error('[Telegram alert failed]', err)
  }
}

// ─── Welcome email ───────────────────────────────────────────────────────

async function sendWelcomeEmail(email: string, agentName: string, dashboardUrl: string) {
  // TODO: Wire up Resend/SendGrid/etc. once Pulkit provides keys
  // For now, just log it
  console.log(`[welcome email] to=${email} agent=${agentName} dashboard=${dashboardUrl}`)
}

// ─── Main provision handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 0. Verify Stripe signature ────────────────────────────────────
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Stripe webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const clerkUserId = session.metadata?.clerk_user_id ?? session.customer_email ?? ''
  const plan = (session.metadata?.plan ?? 'personal') as 'personal' | 'team' | 'business' | 'enterprise'

  console.log(`[provision] Starting for user=${clerkUserId} plan=${plan}`)

  await logProvisioningEvent({
    userId: clerkUserId,
    action: 'webhook_received',
    payload: { eventType: event.type, sessionId: session.id },
  })

  // ── 1. Safety: verify status = "paid" ───────────────────────────
  const row = await getOnboardingByUserId(clerkUserId)

  if (!row) {
    console.warn(`[provision] No onboarding row for user=${clerkUserId}`)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (row.status !== 'paid') {
    console.warn(`[provision] User ${clerkUserId} status is "${row.status}", expected "paid". Aborting.`)
    await alertPulkit(`⚠️ Provision blocked: user=${clerkUserId} status="${row.status}" (expected "paid")`)
    return NextResponse.json({ error: 'Not paid' }, { status: 400 })
  }

  // ── 2. Safety: no duplicate VPS ───────────────────────────────────
  const alreadyHasVPS = await checkUserHasVPS(clerkUserId)
  if (alreadyHasVPS) {
    console.warn(`[provision] User ${clerkUserId} already has a VPS. Skipping.`)
    await alertPulkit(`⚠️ Provision blocked: user=${clerkUserId} already has a VPS`)
    return NextResponse.json({ error: 'Already provisioned' }, { status: 409 })
  }

  // ── 3. Update status → "provisioning" ─────────────────────────────
  await updateOnboardingStatus(clerkUserId, { status: 'provisioning' })

  try {
    // ── 4. Create Composio entity ─────────────────────────────────
    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'create_composio_entity_start',
    })

    const composioRes = await fetch('https://backend.composio.dev/v2/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': COMPOSIO_API_KEY,
      },
      body: JSON.stringify({ identifier: clerkUserId }),
    })

    let composioEntityId = clerkUserId
    if (composioRes.ok) {
      const composioData = await composioRes.json()
      composioEntityId = composioData?.data?.id ?? composioEntityId
    } else {
      console.warn(`[provision] Composio entity creation failed (${composioRes.status}), using clerkUserId as fallback`)
    }

    await logProvisioningEvent({
      userId: clerkUserId,
      action: 'create_composio_entity_done',
      response: { composioEntityId },
    })

    // ── 5. Provision VPS ──────────────────────────────────────────────
    const vps = await provisionVPS({ userId: clerkUserId, plan })

    console.log(`[provision] VPS created: instanceId=${vps.instanceId} ip=${vps.ipAddress}`)

    // ── 6. Build dashboard URL ────────────────────────────────────
    // Dashboard URL: {slug}.app.clawops.studio
    // slug is derived from business_name, slugified
    const businessName = row.business_name ?? 'client'
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
    const dashboardUrl = `https://${slug}.app.clawops.studio`

    // ── 7. Update Supabase ─────────────────────────────────────────
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

    // ── 8. Alert Pulkit ──────────────────────────────────────────
    const agentName = row.agent_name ?? 'Your agent'
    const fullName = row.full_name ?? 'User'
    await alertPulkit(
      `✅ Provisioning complete\n\n` +
      `Name: ${fullName}\n` +
      `Plan: ${plan}\n` +
      `Agent: ${agentName}\n` +
      `Instance: ${vps.instanceId}\n` +
      `IP: ${vps.ipAddress}\n` +
      `Dashboard: ${dashboardUrl}`
    )

    // ── 9. Send welcome email ────────────────────────────────────
    if (row.email) {
      await sendWelcomeEmail(row.email, agentName, dashboardUrl)
    }

    return NextResponse.json({ success: true, dashboardUrl })

  } catch (err: any) {
    console.error(`[provision] Error for user=${clerkUserId}:`, err)

    await updateOnboardingStatus(clerkUserId, {
      status: 'paid', // Revert so it can be retried
    })

    await alertPulkit(`❌ Provisioning failed\n\nuser=${clerkUserId}\nerror=${err.message}`)

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
