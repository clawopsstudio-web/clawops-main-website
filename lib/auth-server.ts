/**
 * lib/auth-server.ts
 * Server-side Supabase auth utilities for API routes.
 * Reads session from cookies in the request.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest } from 'next/server'

/**
 * Get authenticated user ID from request cookies.
 * Works in API routes and Server Components.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  let userId: string | null = null

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(_n: string, _v: string, _o: any) {},
          remove(_n: string, _o: any) {},
        },
      }
    )
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch (err) {
    console.error('[getUserIdFromRequest]', err)
  }

  return userId
}
