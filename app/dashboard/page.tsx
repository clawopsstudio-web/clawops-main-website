'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.log('[DASHBOARD] No session, redirecting to login')
        router.replace('/auth/login')
        return
      }

      const user = session.user
      console.log('[DASHBOARD] Session found for:', user.email)

      // Fetch profile + tasks from Supabase in parallel
      const [profileRes, tasksRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const profile = profileRes.data
      const tasks = tasksRes.data || []

      console.log('[DASHBOARD] Profile:', profile)
      console.log('[DASHBOARD] Tasks:', tasks.length)

      setUserEmail(user.email || '')
      setUserName(
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'User'
      )

      setDashboardData({
        profile: {
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          company: profile?.company || user.user_metadata?.company || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        },
        // Use real tasks if any, else fall back to showing empty state
        tasks: tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status?.toUpperCase() || 'TODO',
          priority: t.priority || 'MEDIUM',
          due_date: t.due_date,
          created_at: t.created_at,
        })),
        tasksTotal: tasks.length,
        pendingTasks: tasks.filter((t: any) => t.status === 'TODO' || t.status === 'todo').length,
        completedTasks: tasks.filter((t: any) => t.status === 'DONE' || t.status === 'done').length,
        instances: [],
        activeAgents: 1,
        userEmail: user.email || '',
      })

      setLoading(false)
    }

    checkAuth()

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

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData} />
    </DashboardShell>
  )
}
