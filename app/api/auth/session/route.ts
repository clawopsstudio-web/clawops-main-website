import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken, userId, expiresIn } = await request.json()

    if (!accessToken || !userId) {
      return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 })
    }

    // Build response first, then set cookies on it
    const response = NextResponse.json({ success: true })

    const cookieOpts = {
      domain: '.app.clawops.studio',
      secure: true,
      sameSite: 'lax' as const,
      httpOnly: true,
      path: '/',
      maxAge: expiresIn ?? 3600,
    }

    response.cookies.set('sb-access-token', accessToken, cookieOpts)
    response.cookies.set('sb-refresh-token', refreshToken ?? '', {
      ...cookieOpts,
      maxAge: 604800,
    })
    response.cookies.set('sb-user-id', userId, {
      ...cookieOpts,
      maxAge: 604800,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
  }
}
