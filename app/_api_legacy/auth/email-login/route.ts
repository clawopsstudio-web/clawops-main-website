import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { message: text } }

    if (!res.ok) {
      return Response.json(
        { error: data.msg || data.error_description || 'Invalid credentials' },
        { status: res.status }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email }
    })

    response.cookies.set('sb-access-token', data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days
    })
    response.cookies.set('sb-refresh-token', data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days
    })
    response.cookies.set('sb-user-id', data.user?.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days
    })

    return response
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
