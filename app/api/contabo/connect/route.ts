import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'


// POST: Store Contabo credentials for a user (upsert)
export async function POST(request: NextRequest) {
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

  const { client_id, client_secret, username, password } = await request.json()

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: 'client_id and client_secret required' }, { status: 400 })
  }

  // Test the credentials first
  const tokenRes = await fetch('https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      username: username || '',
      password: password || '',
      grant_type: 'password',
    }),
  })

  const tokenData = await tokenRes.json()
  
  // Try client_credentials grant if password grant failed
  if (!tokenData.access_token && client_id && client_secret) {
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
    if (ccData.access_token) {
      return saveIntegration(supabase, user.id, { client_id, client_secret })
    }
    return NextResponse.json({ error: 'Invalid Contabo credentials' }, { status: 401 })
  }

  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }

  return saveIntegration(supabase, user.id, { client_id, client_secret, username, password })
}

async function saveIntegration(supabase: any, userId: string, credentials: any) {
  const { error } = await supabase
    .from('user_integrations')
    .upsert({
      user_id: userId,
      provider: 'contabo',
      credentials,
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,provider',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
