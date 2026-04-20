import { createClient } from '@supabase/supabase-js'

// Plain Supabase client. PKCE verifier is stored in localStorage.
// The SDK has a race condition (doesn't await storage before redirect),
// so we handle the delay in the login page.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      // IMPORTANT: must be false so SDK doesn't auto-process the callback URL
      // Our callback page handles the code exchange manually
      detectSessionInUrl: false,
    },
  }
)
