'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const code = searchParams.get('code')

      if (code) {
        console.log('[DASHBOARD] OAuth code detected, exchanging...')
        window.history.replaceState({}, '', '/dashboard')

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[DASHBOARD] Code exchange failed:', error.message)
          router.replace('/auth/login')
          return
        }
        console.log('[DASHBOARD] Session established for:', data.user?.email)
      }

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.log('[DASHBOARD] No session, redirecting to login')
        router.replace('/auth/login')
        return
      }

      const user = session.user
      console.log('[DASHBOARD] Session found for:', user.email)

      const [profileRes, tasksRes, ocStatusRes] = await Promise.all([
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
        // Browser fetches directly from VPS Tailscale domain (browsers can reach Tailscale, Vercel server cannot)
        fetch('https://app.clawops.studio/api/openclaw-status/').then(r => r.ok ? r.json() : null).catch(() => null),
      ])

      const profile = profileRes.data
      const tasks = tasksRes.data || []

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
        // OpenClaw real-time data
        openclaw: ocStatusRes ? {
          agents: (ocStatusRes.agents || []).filter((a: any) => a.isActive).map((a: any) => ({
            name: a.name,
            sessionCount: a.sessionCount,
            lastSeen: a.lastSeen,
            model: a.latestSession?.modelOverride || 'default',
          })),
          totalAgents: (ocStatusRes.agents || []).length,
          activeAgents: (ocStatusRes.agents || []).filter((a: any) => a.isActive).length,
          system: ocStatusRes.system || {},
          cronJobs: (ocStatusRes.cron || {}).jobs || [],
          openclawVersion: (ocStatusRes.openclaw || {}).version || 'unknown',
        } : null,
        instances: [],
        userEmail: user.email || '',
        userId: user.id,
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
  }, [router, searchParams])

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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-white/40">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
