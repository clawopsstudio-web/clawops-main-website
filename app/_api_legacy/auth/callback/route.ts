import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server-client'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const APP_URL = 'https://app.clawops.studio'

  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(
      `${APP_URL}/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || '')}`,
      { status: 307 }
    )
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/auth/login?error=no_code`, { status: 307 })
  }

  try {
    // Debug: list all cookies received
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('=== CALLBACK COOKIES ===')
    console.log('Total cookies:', allCookies.length)
    allCookies.forEach(c => {
      if (c.name.includes('code') || c.name.includes('verifier') || c.name.includes('supabase') || c.name.includes('state')) {
        console.log('  AUTH:', c.name, '=', c.value.substring(0, 50))
      } else {
        console.log('  OTHER:', c.name)
      }
    })

    const supabase = await getServerSupabase()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${APP_URL}/auth/login?error=${encodeURIComponent(exchangeError.message)}`,
        { status: 307 }
      )
    }

    if (data.session) {
      console.log('Session created for user:', data.session.user?.id)
      return NextResponse.redirect(`${APP_URL}/dashboard`, { status: 307 })
    }

    return NextResponse.redirect(`${APP_URL}/auth/login?error=session_failed`, { status: 307 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Callback exception:', message)
    return NextResponse.redirect(
      `${APP_URL}/auth/login?error=${encodeURIComponent(message)}`,
      { status: 307 }
    )
  }
}
