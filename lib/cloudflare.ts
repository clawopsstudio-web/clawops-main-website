/**
 * lib/cloudflare.ts — Cloudflare DNS for customer subdomains
 *
 * Each customer gets: {slug}.app.clawops.studio
 * Subdomain → A record → VPS IP
 */

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

/**
 * Create or update an A-record subdomain in Cloudflare.
 * Returns the full dashboard URL.
 */
export async function registerSubdomain(params: {
  subdomain: string   // e.g. "acme-corp"
  ipAddress: string   // e.g. "178.238.232.52"
}): Promise<{ success: boolean; url: string }> {
  const { subdomain, ipAddress } = params

  const zoneId = env('CLOUDFLARE_ZONE_ID')
  const token = env('CLOUDFLARE_API_TOKEN')
  const baseDomain = 'app.clawops.studio'
  const fullName = `${subdomain}.${baseDomain}`

  // Check if record already exists
  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(fullName)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  const listData = await listRes.json()
  const existing = listData.result?.[0]

  if (existing) {
    // Update existing record
    const updateRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'A',
          name: fullName,
          content: ipAddress,
          proxied: false,
        }),
      }
    )
    const updateData = await updateRes.json()
    if (!updateData.success) {
      throw new Error(`Cloudflare update failed: ${JSON.stringify(updateData.errors)}`)
    }
    return { success: true, url: `https://${fullName}` }
  }

  // Create new record
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'A',
        name: fullName,
        content: ipAddress,
        ttl: 300,
        proxied: false,
      }),
    }
  )
  const createData = await createRes.json()
  if (!createData.success) {
    throw new Error(`Cloudflare record creation failed: ${JSON.stringify(createData.errors)}`)
  }

  return { success: true, url: `https://${fullName}` }
}

/**
 * Generate a URL-safe slug from a business name.
 * Uniquifies if already taken.
 */
export async function generateDashboardUrl(
  businessName: string,
  supabaseAdmin: any
): Promise<{ slug: string; url: string }> {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  if (!base) {
    const fallback = `client-${Date.now().toString(36)}`
    return { slug: fallback, url: `https://${fallback}.app.clawops.studio` }
  }

  // Check uniqueness
  let slug = base
  let attempt = 0
  while (true) {
    const checkName = `${slug}.app.clawops.studio`
    const { data } = await supabaseAdmin
      .from('onboarding_submissions')
      .select('id')
      .eq('dashboard_url', `https://${checkName}`)
      .maybeSingle()

    if (!data) break // unique
    attempt++
    slug = `${base}-${attempt}`
    if (attempt > 99) throw new Error('Too many subdomain collisions')
  }

  return { slug, url: `https://${slug}.app.clawops.studio` }
}
