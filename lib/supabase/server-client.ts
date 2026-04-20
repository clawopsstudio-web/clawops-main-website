import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // @supabase/ssr getAll is async — read all cookies from Next.js store
        async getAll() {
          return cookieStore.getAll()
        },
        // @supabase/ssr setAll is async and takes (cookies, metadata)
        // metadata must be passed for proper cookie caching behavior
        async setAll(cookiesToSet, metadata = {}) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
            void metadata // @supabase/ssr passes cache headers — Next.js handles these
          } catch {
            // Server Component context — ignore
          }
        },
      },
    }
  )
}
