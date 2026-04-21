import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// POST: Store Contabo credentials for a user (upsert)
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { client_id, client_secret, username, password } = await request.json()

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: 'client_id and client_secret required' }, { status: 400 })
  }

  // Test with client_credentials grant
  const ccRes = await fetch('https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      grant_type: 'client_credentials',
    }),
  })

  const ccData = await ccRes.json()
  if (!ccData.access_token) {
    return NextResponse.json({ error: 'Invalid Contabo credentials' }, { status: 401 })
  }

  const { error } = await supabase
    .from('user_integrations')
    .upsert({
      user_id: userId,
      provider: 'contabo',
      credentials: { client_id, client_secret, username, password },
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,provider',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
