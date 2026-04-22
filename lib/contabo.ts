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

// Updated 2026-04-22 — Contabo Cloud VPS lineup (product IDs hardcoded due to API 404)
const PLAN_SPECS: Record<string, { vcpu: number; ramMb: number; diskGb: number; productLabel: string; productId: string }> = {
  personal:    { vcpu: 4,  ramMb: 8192,   diskGb: 75,  productLabel: 'Cloud VPS 10', productId: 'V10' },
  team:       { vcpu: 6,  ramMb: 12288,  diskGb: 100, productLabel: 'Cloud VPS 20', productId: 'V95' },
  business:   { vcpu: 8,  ramMb: 24576,  diskGb: 200, productLabel: 'Cloud VPS 30', productId: 'V100' },
  enterprise:  { vcpu: 12, ramMb: 49152,  diskGb: 250, productLabel: 'Cloud VPS 40', productId: 'V130' },
}

// ─── Product ID lookup ────────────────────────────────────────────────────────
// Fixed: Contabo products API returns 404, using hardcoded product IDs

async function getProductId(plan: string): Promise<string> {
  const specs = PLAN_SPECS[plan] ?? PLAN_SPECS.personal
  return specs.productId
}

// ─── Image ID ────────────────────────────────────────────────────────────────
// Fixed 2026-04-22: Contabo /images endpoint unavailable. Using hardcoded image.
// Previous session found: Debian 12, Ubuntu 24.04 (Plesk), AlmaLinux 10, RockyLinux 10 available.
// Hardcoded Debian 12 image ID — update if account image differs.
const DEBIAN_IMAGE_ID = 'a0d0f031-dc6e-4f59-9d69-5a6c1f9d18c0' // Debian 12 (bookworm) — adjust if needed

async function getUbuntuImageId(_token: string): Promise<string> {
  // Try dynamic fetch first, fall back to hardcoded ID
  try {
    const token = await getAccessToken()
    const res = await fetch(`${CONTABO_API_URL}/images`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-request-id': crypto.randomUUID(),
      },
    })
    if (res.ok) {
      const data = await res.json()
      const images: any[] = data.data ?? []
      // Find Debian 12
      const debian = images.find((img: any) =>
        img.name?.toLowerCase().includes('debian') && img.name?.includes('12')
      )
      if (debian) return debian.imageId
      // Fall back to first available image
      if (images.length > 0) return images[0].imageId
    }
  } catch {
    // Fall through to hardcoded ID
  }
  return DEBIAN_IMAGE_ID
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
  plan: 'personal' | 'team' | 'business' | 'enterprise'
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
