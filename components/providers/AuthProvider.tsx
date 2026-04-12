'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync Supabase session with the auth store on mount
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Dispatch custom event so other components can listen
        window.dispatchEvent(new CustomEvent('supabase:session', { detail: session }))
      }
    }
    syncSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.dispatchEvent(new CustomEvent('supabase:session', { detail: session }))
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
