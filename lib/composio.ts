/**
 * lib/composio.ts — Composio v1.x (@composio/core)
 *
 * Composio SDK docs: docs.composio.dev
 * Key patterns:
 * - composio.create(userId) → Session
 * - session.toolkits() → all toolkits + connection status
 * - session.authorize(slug, { callbackUrl }) → redirect URL
 * - session.authorize().waitForConnection() → poll until done
 * - composio.connectedAccounts.delete(id) → disconnect
 */

import { Composio } from '@composio/core'

function getComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY
  if (!apiKey) throw new Error('COMPOSIO_API_KEY not set')
  return new Composio({ apiKey })
}

// ─── List toolkits + their connection status ───────────────────────────

export interface ToolkitInfo {
  slug: string
  name: string
  logo: string | null
  isNoAuth: boolean
  isConnected: boolean
  connectedAccountId: string | null
  connection?: {
    isActive: boolean
    createdAt?: string | null
  }
}

export async function listToolkits(userId: string): Promise<ToolkitInfo[]> {
  const composio = getComposio()
  const session = await composio.create(userId)
  const { items } = await session.toolkits()

  return items.map(t => ({
    slug: t.slug,
    name: t.name,
    logo: t.logo ?? null,
    isNoAuth: t.isNoAuth ?? false,
    isConnected: t.connection?.isActive ?? false,
    connectedAccountId: t.connection?.authConfig?.id ?? null,
  }))
}

export async function getToolStatus(userId: string, slug: string): Promise<boolean> {
  const all = await listToolkits(userId)
  return all.some(t => t.slug === slug && t.isConnected)
}

// ─── List toolkits + their connection status ───────────────────────────

export async function createUserSession(userId: string, toolkits: string[]) {
  const composio = getComposio()
  const session = await composio.create(userId)

  // Pre-authorize toolkits so they're ready when user clicks connect
  for (const toolkit of toolkits) {
    try {
      await session.authorize(toolkit, {
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://clawops.studio'}/api/composio/callback`,
      })
    } catch (err: any) {
      console.error('[composio] Failed to pre-authorize', toolkit, err.message)
    }
  }

  return { userId, session }
}

// ─── Get OAuth connect link for a specific app ──────────────────────────

export async function getOAuthRedirectUrl(
  userId: string,
  slug: string
): Promise<string> {
  const composio = getComposio()
  const session = await composio.create(userId)

  const request = await session.authorize(slug, {
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://clawops.studio'}/api/composio/callback`,
  })

  if (!request.redirectUrl) {
    throw new Error(`No redirect URL from Composio for ${slug}`)
  }

  return request.redirectUrl
}

// ─── Check if user has an active connection for a specific app ───────────

export async function getConnectionStatus(userId: string, appName: string) {
  const all = await listToolkits(userId)
  const toolkit = all.find(t => t.slug === appName.toLowerCase())

  return {
    connected: toolkit?.isConnected ?? false,
    connectedAccountId: toolkit?.connectedAccountId ?? null,
    connectedAt: toolkit?.connection?.createdAt ?? null,
  }
}

// ─── Activate paid Composio plan for an entity (team + business plans) ───

export async function activateComposioPaidPlan(userId: string): Promise<void> {
  const apiKey = process.env.COMPOSIO_API_KEY!
  const body = JSON.stringify({
    user_id: userId,
    plan: 'team', // or 'pro' — Composio plan identifier
  })

  const res = await fetch('https://backend.composio.dev/v2/user/upgrade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[composio] Failed to activate paid plan:', err)
    // Non-fatal — log but don't throw. User can still use free tier.
  }
}

// ─── Wait for OAuth completion (server-side poll) ───────────────────────

export async function waitForConnection(
  userId: string,
  slug: string,
  timeoutMs = 120_000
): Promise<{ id: string }> {
  const composio = getComposio()
  const session = await composio.create(userId)
  const request = await session.authorize(slug)
  return request.waitForConnection(timeoutMs)
}

// ─── Log a connection event to Supabase user_connections table ──────────

export async function upsertConnection(params: {
  supabaseAdmin: any
  clerkUserId: string
  appName: string
  connected: boolean
  connectedAccountId?: string | null
  connectedAt?: string | null
}) {
  const { supabaseAdmin, clerkUserId, appName, connected, connectedAccountId, connectedAt } = params
  await supabaseAdmin
    .from('user_connections')
    .upsert({
      clerk_user_id: clerkUserId,
      app_name: appName.toUpperCase(),
      connected,
      connected_account_id: connectedAccountId ?? null,
      connected_at: connectedAt ?? null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'clerk_user_id,app_name',
    })
}

// ─── Process OAuth callback ─────────────────────────────────────────────

export interface OAuthCallbackResult {
  status: 'success' | 'failed'
  connectedAccountId?: string
  error?: string
}

export function parseOAuthCallback(url: URL): OAuthCallbackResult {
  const status = url.searchParams.get('status')
  const connectedAccountId = url.searchParams.get('connected_account_id')
  if (status === 'success' && connectedAccountId) {
    return { status: 'success', connectedAccountId }
  }
  return { status: 'failed', error: `Auth failed: ${status}` }
}

// ─── Disconnect ────────────────────────────────────────────────────────

export async function disconnectAccount(accountId: string): Promise<void> {
  const composio = getComposio()
  await composio.connectedAccounts.delete(accountId)
}