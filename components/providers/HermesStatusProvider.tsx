'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface HermesStatusContextValue {
  hermesOnline: boolean
  hermesStatus: any | null
  hermesError: string | null
}

const HermesStatusContext = createContext<HermesStatusContextValue>({
  hermesOnline: false,
  hermesStatus: null,
  hermesError: null,
})

export const useHermesStatus = () => useContext(HermesStatusContext)

export default function HermesStatusProvider({ children }: { children: React.ReactNode }) {
  const [hermesOnline, setHermesOnline] = useState(false)
  const [hermesStatus, setHermesStatus] = useState<any | null>(null)
  const [hermesError, setHermesError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10_000)
        const res = await fetch('/api/hermes/status', { signal: controller.signal })
        clearTimeout(timeout)
        if (!mounted) return
        if (res.ok) {
          const json = await res.json()
          setHermesOnline(true)
          setHermesStatus(json.status ?? json)
          setHermesError(null)
        } else {
          setHermesOnline(false)
        }
      } catch {
        if (mounted) {
          setHermesOnline(false)
        }
      }
    }

    check()
    const id = setInterval(check, 30_000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  return (
    <HermesStatusContext.Provider value={{ hermesOnline, hermesStatus, hermesError }}>
      {children}
    </HermesStatusContext.Provider>
  )
}
