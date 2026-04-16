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
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // disable detectSessionInUrl — we handle OAuth callbacks via /api/auth/callback
    // The SDK will still work for session management, just not auto-detect from URL
    detectSessionInUrl: false,
    // PKCE flow — sends code_challenge to Supabase
    // Used when SDK signInWithOAuth is called (fallback/legacy path)
    flowType: 'pkce',
  },
})
