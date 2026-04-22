/**
 * lib/provision-orchestrator.ts — Shared provisioning logic
 *
 * Used by:
 *   - app/api/webhooks/stripe/route.ts
 *   - app/api/provision/route.ts (MOCK_PAYMENT bypass)
 */

import {
  supabaseAdmin,
  getOnboardingByUserId,
  updateOnboardingStatus,
  checkUserHasVPS,
  logProvisioningEvent,
} from '@/lib/supabase-admin'
import { provisionVPS } from '@/lib/contabo'
import { createUserSession, activateComposioPaidPlan } from '@/lib/composio'

export type Plan = 'personal' | 'team' | 'business'

function envOpt(key: string): string | undefined {
  return process.env[key]
}

// ─── Telegram alerts ────────────────────────────────────────────────────

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

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || `client-${Date.now().toString(36)}`
  )
}

// ─── Core provisioning logic ──────────────────────────────────────────

export async function runProvisioning(params: {
  clerkUserId: string
  plan: Plan
}): Promise<{ success: true; dashboardUrl: string }> {
  const { clerkUserId, plan } = params

  // 1. Fetch user row
  const row = await getOnboardingByUserId(clerkUserId)
  if (!row) throw new Error(`User not found: ${clerkUserId}`)
  // Fetch email from profiles table if not in onboarding_submissions
  let email = row.email ?? 'unknown'
  if (!row.email) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', clerkUserId)
        .maybeSingle()
      if (profile?.email) email = profile.email
    } catch {}
  }

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
    }

    // 7. Activate paid plan for team/business
    if (plan === 'team' || plan === 'business') {
      try {
        await logProvisioningEvent({ userId: clerkUserId, action: 'composio_paid_plan_start' })
        await activateComposioPaidPlan(clerkUserId)
        await logProvisioningEvent({ userId: clerkUserId, action: 'composio_paid_plan_done' })
      } catch (planErr: any) {
        console.error('[provision] Composio paid plan (non-fatal):', planErr.message)
      }
    }

    // 8. Provision VPS
    const vps = await provisionVPS({ userId: clerkUserId, plan })

    // 9. Telegram POINT 2 — VPS live
    const slug = slugify(row.business_name ?? 'client')
    await alertPulkit(Telegram.vpsLive(email, vps.ipAddress, slug))

    // 10. Update Supabase
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

    return { success: true, dashboardUrl }

  } catch (err: any) {
    await alertPulkit(Telegram.failure(email, 'provisioning', err.message))
    await updateOnboardingStatus(clerkUserId, { status: 'paid' })
    throw err
  }
}
