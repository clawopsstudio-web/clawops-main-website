/**
 * lib/contabo.ts — Contabo VPS provisioning
 *
 * Auth: OAuth2 password grant
 * Token: https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token
 * API:  https://api.contabo.com/v1/compute/instances
 */

import { logProvisioningEvent } from './supabase-admin'

const CONTABO_AUTH_URL = 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token'
const CONTABO_API_URL = 'https://api.contabo.com/v1/compute'

// ─── Auth token ──────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token
  }

  const clientId = process.env.CONTABO_CLIENT_ID
  const clientSecret = process.env.CONTABO_CLIENT_SECRET
  const apiUser = process.env.CONTABO_API_USER
  const apiPassword = process.env.CONTABO_API_PASSWORD

  if (!clientId || !clientSecret || !apiUser || !apiPassword) {
    throw new Error(
      'Missing Contabo env vars: CONTABO_CLIENT_ID, CONTABO_CLIENT_SECRET, ' +
      'CONTABO_API_USER, CONTABO_API_PASSWORD'
    )
  }

  const res = await fetch(CONTABO_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      username: apiUser,
      password: apiPassword,
      grant_type: 'password',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Contabo auth failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const expiresIn = (data.expires_in ?? 300) * 1000 // ms

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn,
  }

  return cachedToken.token
}

// ─── VPS specs per plan ───────────────────────────────────────────────────────

// Updated 2026-04-22 — 3 tiers only, no Enterprise
// Product IDs: Contabo products API returns 404, using hardcoded IDs
// Note: Update productId values if Contabo Cloud VPS 20/30/40 have different IDs
const PLAN_SPECS: Record<string, { vcpu: number; ramMb: number; diskGb: number; productLabel: string; productId: string }> = {
  personal:  { vcpu: 6,  ramMb: 12288,  diskGb: 100, productLabel: 'Cloud VPS 20', productId: 'V95'  },
  team:     { vcpu: 8,  ramMb: 24576,  diskGb: 200, productLabel: 'Cloud VPS 30', productId: 'V100' },
  business: { vcpu: 12, ramMb: 49152,  diskGb: 250, productLabel: 'Cloud VPS 40', productId: 'V130' },
}

// ─── Product ID lookup ────────────────────────────────────────────────────────
// Fixed: Contabo products API returns 404, using hardcoded product IDs

async function getProductId(plan: string): Promise<string> {
  const specs = PLAN_SPECS[plan] ?? PLAN_SPECS.personal
  return specs.productId
}

// ─── Image ID ────────────────────────────────────────────────────────────────
// Confirmed working 2026-04-22: Ubuntu 24.04 LTS image ID from Contabo account.
// Image: ubuntu-24.04, standardImage: true, OS: Linux
const UBUNTU_IMAGE_ID = 'd64d5c6c-9dda-4e38-8174-0ee282474d8a'

async function getUbuntuImageId(_token: string): Promise<string> {
  // Hardcoded Ubuntu 24.04 LTS — confirmed working on this Contabo account
  return UBUNTU_IMAGE_ID
}

// ─── Main provisioning function ────────────────────────────────────────────────

export interface ProvisionVPSResult {
  instanceId: string
  ipAddress: string
  name: string
  status: string
}

export async function provisionVPS(params: {
  userId: string
  plan: 'personal' | 'team' | 'business'
  instanceName?: string
}): Promise<ProvisionVPSResult> {
  const { userId, plan, instanceName } = params
  const name = instanceName ?? `clawops-${userId.slice(0, 8)}`

  await logProvisioningEvent({
    userId,
    action: 'provision_vps_start',
    payload: { plan, name },
  })

  try {
    const token = await getAccessToken()

    // Get product and image IDs
    const [productId, imageId] = await Promise.all([
      getProductId(plan),
      getUbuntuImageId(token),
    ])

    // Create instance
    const createRes = await fetch(`${CONTABO_API_URL}/instances`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-request-id': crypto.randomUUID(),
      },
      body: JSON.stringify({
        productId,
        imageId,
        name,
        region: 'EU',
        // No availabilityZone = let Contabo pick default
      }),
    })

    if (!createRes.ok) {
      const errBody = await createRes.text()
      await logProvisioningEvent({
        userId,
        action: 'provision_vps_failed',
        payload: { plan, name },
        response: { status: createRes.status, body: errBody },
        status: 'error',
      })
      throw new Error(`Contabo instance creation failed (${createRes.status}): ${errBody}`)
    }

    const instance = await createRes.json()
    const instanceId = String(instance.instanceId ?? instance.id)
    const ipAddress = instance.ipConfig?.v4?.ip ?? instance.ipv4 ?? ''

    await logProvisioningEvent({
      userId,
      action: 'provision_vps_success',
      payload: { plan, name, productId, imageId },
      response: { instanceId, ipAddress, status: instance.status },
      status: 'ok',
    })

    return {
      instanceId,
      ipAddress,
      name,
      status: instance.status ?? 'creating',
    }

  } catch (err: any) {
    await logProvisioningEvent({
      userId,
      action: 'provision_vps_error',
      payload: { plan, name },
      response: { error: err.message },
      status: 'error',
    })
    throw err
  }
}

// ─── Instance status check ────────────────────────────────────────────────────

export async function getInstanceStatus(instanceId: string): Promise<string> {
  const token = await getAccessToken()

  const res = await fetch(`${CONTABO_API_URL}/instances/${instanceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-request-id': crypto.randomUUID(),
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to get instance status: ${res.status}`)
  }

  const data = await res.json()
  return data.status ?? 'unknown'
}
