'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthContextValue {
  userId: string | null
  user: any
  isSignedIn: boolean
  isLoaded: boolean
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  user: null,
  isSignedIn: false,
  isLoaded: false,
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    userId: null,
    user: null,
    isSignedIn: false,
    isLoaded: false,
  })

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
        isSignedIn: !!session,
        isLoaded: true,
      })
    })
    // Initial load
    supabase.auth.getUser().then(({ data }) => {
      setState({
        userId: data.user?.id ?? null,
        user: data.user ?? null,
        isSignedIn: !!data.user,
        isLoaded: true,
      })
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
