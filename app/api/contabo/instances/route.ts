import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'


// GET: Fetch all Contabo instances from Contabo API for the authenticated user
export async function GET(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get Contabo credentials for this user
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('provider', 'contabo')
    .single()

  if (!integration) {
    return NextResponse.json({ connected: false, instances: [] })
  }

  const creds = integration.credentials

  // Get OAuth token from Contabo
  const tokenRes = await fetch('https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      username: creds.username,
      password: creds.password,
      grant_type: 'password',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.json({ connected: false, error: 'Auth failed' }, { status: 401 })
  }

  // Fetch instances from Contabo
  const instancesRes = await fetch('https://api.contabo.com/v1/compute/instances', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'x-request-id': crypto.randomUUID(),
    },
  })

  if (!instancesRes.ok) {
    return NextResponse.json({ connected: true, error: 'Failed to fetch instances' }, { status: 502 })
  }

  const raw = await instancesRes.json()
  const instances = Array.isArray(raw.data) ? raw.data : []

  return NextResponse.json({
    connected: true,
    instances: instances.map((inst: any) => ({
      instance_id: String(inst.instanceId),
      name: inst.name || `vmi${inst.instanceId}`,
      ip_v4: inst.ipConfig?.v4?.ip || null,
      product_id: inst.productId,
      product_name: inst.productName,
      status: inst.status,
      region: inst.region,
      ram_mb: inst.ramMb,
      cpu_cores: inst.cpuCores,
      disk_mb: inst.diskMb,
      created_date: inst.createdDate,
    })),
  })
}
