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

  // Read cookies directly for userId validation (middleware already validated the session)
  const cookieStore = await cookies()
  const sbUserId = cookieStore.get('sb-user-id')?.value

  // Verify the userId in URL matches the authenticated user
  if (!sbUserId || sbUserId !== userId) {
    redirect('/auth/login')
  }

  // Create supabase client only for data fetching (not for auth validation)
  const supabase = await createClient(cookieStore)

  // Fetch user data in parallel
  const [profileResult, tasksResult, instancesResult, openclawResult] = await Promise.allSettled([
    supabase.from('profiles').select('*').eq('id', sbUserId).single(),
    supabase.from('tasks').select('*').eq('user_id', sbUserId).order('created_at', { ascending: false }).limit(10),
    supabase.from('instances').select('*').eq('user_id', sbUserId),
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
    userEmail: profile?.email || '',
    userId: sbUserId,
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData} />
    </DashboardShell>
  )
}
