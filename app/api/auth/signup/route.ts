import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Use admin API to create user WITHOUT requiring email confirmation
    const adminRes = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true, // Skip email confirmation
        user_metadata: { name: name || email.split('@')[0] },
      }),
    })

    const adminText = await adminRes.text()
    let adminData: any
    try { adminData = JSON.parse(adminText) } catch { adminData = { message: adminText } }

    if (!adminRes.ok && adminRes.status !== 400) {
      console.error('Admin signup error:', adminText)
      // Fall through to regular signup
    }

    // If admin API failed with 400 (e.g. user already exists), try regular login
    if (!adminRes.ok && adminData?.msg !== 'User already registered') {
      // Try regular anonymous signup as fallback
      const anonRes = await fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': 'Bearer ' + ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      })
      const anonText = await anonRes.text()
      let anonData: any
      try { anonData = JSON.parse(anonText) } catch { anonData = {} }

      if (!anonRes.ok) {
        console.error('Anon signup error:', anonText)
        return Response.json(
          { error: 'Signup failed. ' + (anonData.msg || anonData.error_description || 'Try logging in instead.') },
          { status: anonRes.status }
        )
      }
    }

    // Now log the user in (get session)
    const loginRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    const loginText = await loginRes.text()
    if (!loginRes.ok) {
      let errData: any
      try { errData = JSON.parse(loginText) } catch { errData = {} }
      return Response.json(
        { error: errData.msg || errData.error_description || 'Account created but login failed. Try logging in.' },
        { status: loginRes.status }
      )
    }

    const session = JSON.parse(loginText)

    const response = NextResponse.json({
      success: true,
      user: {
        id: session.user?.id,
        email: session.user?.email,
      }
    })

    // Set session cookies
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in || 3600,
    })
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    response.cookies.set('sb-user-id', session.user?.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: session.expires_in || 3600,
    })

    return response
  } catch (e: any) {
    console.error('Signup error:', e)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
