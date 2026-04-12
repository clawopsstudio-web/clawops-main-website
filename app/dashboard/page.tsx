'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { MOCK_TASKS } from '@/lib/mock-data'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      // getSession reads from the Supabase client's local storage + cookies
      // This is the SAME session that the auth callback established
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.log('[DASHBOARD] No session, redirecting to login')
        router.replace('/auth/login')
        return
      }

      console.log('[DASHBOARD] Session found for:', session.user?.email)
      setUserEmail(session.user?.email || '')
      setUserName(
        session.user?.user_metadata?.full_name ||
        session.user?.email?.split('@')[0] ||
        'User'
      )
      setLoading(false)
    }

    checkAuth()

    // Also listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-white/40">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const dashboardData = {
    profile: {
      full_name: userName,
      company: '',
      avatar_url: '',
    },
    tasks: MOCK_TASKS.slice(0, 10),
    tasksTotal: MOCK_TASKS.length,
    pendingTasks: MOCK_TASKS.filter((t: any) => t.status === 'TODO').length,
    completedTasks: MOCK_TASKS.filter((t: any) => t.status === 'DONE').length,
    instances: [],
    activeAgents: 1,
    userEmail: userEmail,
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData as any} />
    </DashboardShell>
  )
}
