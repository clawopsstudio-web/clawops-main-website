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

// Updated 2026-04-21 — Contabo Cloud VPS lineup
const PLAN_SPECS: Record<string, { vcpu: number; ramMb: number; diskGb: number; productLabel: string }> = {
  personal:    { vcpu: 4,  ramMb: 8192,   diskGb: 75,  productLabel: 'Cloud VPS 10' },
  team:       { vcpu: 6,  ramMb: 12288,  diskGb: 100, productLabel: 'Cloud VPS 20' },
  business:   { vcpu: 8,  ramMb: 24576,  diskGb: 200, productLabel: 'Cloud VPS 30' },
  enterprise:  { vcpu: 12, ramMb: 49152,  diskGb: 250, productLabel: 'Cloud VPS 40' },
}

// ─── Product ID lookup ────────────────────────────────────────────────────────
// We cache product IDs after first fetch to avoid repeated API calls.

const productIdCache: Map<string, string> = new Map()

async function getProductId(plan: string): Promise<string> {
  if (productIdCache.has(plan)) {
    return productIdCache.get(plan)!
  }

  const token = await getAccessToken()
  const specs = PLAN_SPECS[plan] ?? PLAN_SPECS.personal

  // Fetch products from Contabo catalog
  const res = await fetch(`${CONTABO_API_URL}/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-request-id': crypto.randomUUID(),
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch Contabo products: ${res.status}`)
  }

  const data = await res.json()
  const products: any[] = data.data ?? []

  // Match by vCPU + RAM. Fall back to first available if exact match not found.
  const match = products.find(p =>
    p.availability?.includes('AVAILABLE') &&
    p.cpuCores === specs.vcpu &&
    p.ramMb === specs.ramMb
  ) ?? products[0]

  if (!match) {
    throw new Error(`No Contabo product found for plan: ${plan}`)
  }

  productIdCache.set(plan, match.productId)
  return match.productId
}

// ─── Image ID (Ubuntu 22.04 LTS) ─────────────────────────────────────────────
const UBUNTU_IMAGE_ID = 'Ubuntu 22.04 LTS (Jammy Jellyfish)' // fallback display name
// The actual imageId will be fetched from the images endpoint

async function getUbuntuImageId(token: string): Promise<string> {
  const res = await fetch(`${CONTABO_API_URL}/images`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-request-id': crypto.randomUUID(),
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch Contabo images: ${res.status}`)
  }

  const data = await res.json()
  const images: any[] = data.data ?? []

  // Find Ubuntu 22.04
  const ubuntu = images.find((img: any) =>
    img.name?.includes('Ubuntu') && img.name?.includes('22.04')
  )

  if (!ubuntu) {
    throw new Error('Ubuntu 22.04 LTS image not found in Contabo catalog')
  }

  return ubuntu.imageId
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
