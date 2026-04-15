import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey
  })
}

// Browser client — session stored in localStorage by default
// No cookie domain needed for browser-side storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // CRITICAL: Use PKCE flow for OAuth. Without this, the OAuth code exchange
    // fails silently (flowType defaults to 'implicit' which is broken with Google OAuth).
    // PKCE ensures the code_verifier is stored and used during the callback exchange.
    // 'implicit' puts access_token in URL fragment — simpler, works reliably
    // with custom redirectTo URLs. 'pkce' requires server-side code exchange which
    // needs the code_verifier that the SDK doesn't expose reliably.
    flowType: 'implicit',
  },
})
