import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { action } = body

  if (action === 'fetch_from_contabo') {
    try {
      const { data: contaboToken } = await supabase
        .from('user_integrations')
        .select('credentials')
        .eq('user_id', userId)
        .eq('provider', 'contabo')
        .single()

      if (!contaboToken) {
        return NextResponse.json({ error: 'Contabo not connected' }, { status: 400 })
      }

      const creds = contaboToken.credentials
      const tokenRes = await fetch('https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.client_id,
          client_secret: creds.client_secret,
          username: creds.username || '',
          password: creds.password || '',
          grant_type: 'password',
        }),
      })

      const tokenData = await tokenRes.json()
      if (!tokenData.access_token) {
        return NextResponse.json({ error: 'Contabo auth failed' }, { status: 401 })
      }

      const instancesRes = await fetch('https://api.contabo.com/v1/compute/instances', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'x-request-id': crypto.randomUUID(),
        },
      })

      const raw = await instancesRes.json()
      const instances = Array.isArray(raw.data) ? raw.data : []

      for (const inst of instances) {
        await supabase
          .from('vps_instances')
          .upsert({
            user_id: userId,
            instance_id: String(inst.instanceId),
            name: inst.name || inst.displayName || `vmi${inst.instanceId}`,
            ip_v4: inst.ipConfig?.v4?.ip || null,
            ip_v6: inst.ipConfig?.v6?.ip || null,
            product_id: inst.productId,
            status: inst.status,
            region: inst.region,
            ram_mb: inst.ramMb,
            cpu_cores: inst.cpuCores,
            disk_mb: inst.diskMb,
          }, {
            onConflict: 'user_id,instance_id',
          })
      }

      return NextResponse.json({ synced: instances.length, instances })

    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  if (action === 'register_instance') {
    const { instance_id, name, ip_v4, product_id, region } = body
    if (!instance_id) return NextResponse.json({ error: 'instance_id required' }, { status: 400 })

    const { data: instance, error } = await supabase
      .from('vps_instances')
      .upsert({
        user_id: userId,
        instance_id: String(instance_id),
        name: name || `vmi${instance_id}`,
        ip_v4: ip_v4 || null,
        product_id: product_id || null,
        region: region || null,
        status: 'tracked',
      }, {
        onConflict: 'user_id,instance_id',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ instance })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
