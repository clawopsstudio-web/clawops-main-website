import { createBrowserClient } from '@supabase/ssr'

// Legacy optional Supabase browser client.
// The public marketing site no longer requires Supabase, so do not instantiate
// at module import time. Legacy dashboard/auth pages will receive a clear error
// only if they are used without Supabase env vars.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured for this deployment')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return (createClient() as any)[prop]
  },
})
