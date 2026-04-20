import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Clears all auth cookies and redirects to /auth/login
 */
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 })

  // Clear all session cookies
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-user-id',
  ]

  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    })
  }

  return response
}

/**
 * GET /api/auth/logout — also works as a direct redirect
 */
export async function GET() {
  const response = NextResponse.redirect(new URL('/auth/login', 'https://app.clawops.studio'))

  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-user-id',
  ]

  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    })
  }

  return response
}
