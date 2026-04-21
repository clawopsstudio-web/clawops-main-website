'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useContext, useEffect } from 'react'

interface AuthContextValue {
  userId: string | null
  user: ReturnType<typeof useUser>['user']
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
  const { user, isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      window.dispatchEvent(new CustomEvent('clerk:session', { detail: { user, isSignedIn } }))
    } else if (isLoaded && !isSignedIn) {
      window.dispatchEvent(new CustomEvent('clerk:session', { detail: { user: null, isSignedIn: false } }))
    }
  }, [user, isSignedIn, isLoaded])

  return (
    <AuthContext.Provider
      value={{
        userId: user?.id ?? null,
        user,
        isSignedIn: isSignedIn ?? false,
        isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
