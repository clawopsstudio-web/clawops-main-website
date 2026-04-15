import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

interface Props {
  params: Promise<{ userId: string }>
}

function decodeJWT(token: string): { sub: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

async function resolveUserId(
  urlUserId: string,
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<string | null> {
  // Method 1: JWT cookie (set by our auth flow)
  const accessToken = cookieStore.get('sb-access-token')?.value
  if (accessToken) {
    const payload = decodeJWT(accessToken)
    if (payload?.sub) return payload.sub
  }

  // Method 2: sb-user-id cookie (fallback)
  const sbUserId = cookieStore.get('sb-user-id')?.value
  if (sbUserId) return sbUserId

  // Method 3: No server-side cookie — client-side SDK session.
  // Return the URL userId and let the client component handle cookie sync.
  // We trust the URL param here because middleware already validated the JWT.
  return urlUserId
}

export default async function UserDashboardPage({ params }: Props) {
  const { userId: urlUserId } = await params
  const cookieStore = await cookies()
  const validUserId = await resolveUserId(urlUserId, cookieStore)

  // If userId in URL doesn't match authenticated user, block
  if (!validUserId || validUserId !== urlUserId) {
    redirect('/auth/login')
  }

  // Create supabase client for data fetching
  let supabase
  try {
    supabase = await createClient(cookieStore)
  } catch (e) {
    console.error('[dashboard] createClient failed:', e)
    redirect('/auth/login')
  }

  // Fetch user data in parallel
  const [profileResult, tasksResult, instancesResult, openclawResult] = await Promise.allSettled([
    supabase.from('profiles').select('*').eq('id', validUserId).single(),
    supabase.from('tasks').select('*').eq('user_id', validUserId).order('created_at', { ascending: false }).limit(10),
    supabase.from('instances').select('*').eq('user_id', validUserId),
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
    userId: validUserId,
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData} />
    </DashboardShell>
  )
}
