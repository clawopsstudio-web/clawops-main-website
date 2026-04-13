import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserDashboardPage({ params }: Props) {
  const { userId } = await params

  // Server-side auth check
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { data: { session }, error: authError } = await supabase.auth.getSession()

  if (authError || !session) {
    redirect('/auth/login')
  }

  // Verify the session user matches the URL userId
  if (session.user.id !== userId) {
    redirect('/auth/login')
  }

  // Fetch user data in parallel
  const [profileResult, tasksResult, instancesResult, openclawResult] = await Promise.allSettled([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('instances').select('*').eq('user_id', userId),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://app.clawops.studio'}/api/openclaw-status/`, {
      next: { revalidate: 30 },
    }).then(r => r.json()).catch(() => null),
  ])

  const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
  const tasks = tasksResult.status === 'fulfilled' ? (tasksResult.value.data || []) : []
  const instances = instancesResult.status === 'fulfilled' ? (instancesResult.value.data || []) : []
  const openclaw = openclawResult.status === 'fulfilled' ? openclawResult.value : null

  const dashboardData = {
    profile: profile ? {
      full_name: profile.full_name || '',
      company: profile.company || '',
      avatar_url: profile.avatar_url || '',
    } : { full_name: '', company: '', avatar_url: '' },
    tasksTotal: tasks.length,
    pendingTasks: tasks.filter((t: any) => t.status === 'pending').length,
    completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
    tasks,
    instances,
    activeAgents: openclaw?.agents?.filter((a: any) => a.isActive).length || 0,
    openclaw: openclaw ? {
      agents: openclaw.agents || [],
      totalAgents: openclaw.totalAgents || 0,
      activeAgents: openclaw.agents?.filter((a: any) => a.isActive).length || 0,
      system: openclaw.system || {},
      cronJobs: openclaw.cronJobs || [],
      openclawVersion: openclaw.openclawVersion || '',
    } : null,
    userEmail: session.user.email,
    userId: session.user.id,
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData} />
    </DashboardShell>
  )
}
