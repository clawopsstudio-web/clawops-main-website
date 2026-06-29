/**
 * app/api/auth/logout/route.ts
 * Clears session cookies — logs user out
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.signOut()
  return response
}
