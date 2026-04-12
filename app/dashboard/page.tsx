import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { MOCK_TASKS } from '@/lib/mock-data'

export default async function DashboardPage() {
  // Server-side auth check using Supabase SSR
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            })
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dashboardData = {
    profile: {
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      company: user.user_metadata?.company || '',
      avatar_url: user.user_metadata?.avatar_url || '',
    },
    tasks: MOCK_TASKS.slice(0, 10),
    tasksTotal: MOCK_TASKS.length,
    pendingTasks: MOCK_TASKS.filter((t: any) => t.status === 'TODO').length,
    completedTasks: MOCK_TASKS.filter((t: any) => t.status === 'DONE').length,
    instances: [],
    activeAgents: 1,
    userEmail: user.email ?? '',
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData as any} />
    </DashboardShell>
  )
}
