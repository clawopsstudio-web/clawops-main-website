import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function DashboardPage() {
  // TEMP: Skip auth check for testing
  // Will add real auth later
  
  // const cookieStore = await cookies()
  // const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
  //   cookies: {
  //     getAll() {
  //       return cookieStore.getAll()
  //     },
  //   },
  // })
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/auth/login')
  // }

  const [profileResult, tasksResult, instancesResult, agentsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('vps_instances').select('*').eq('user_id', user.id),
    supabase.from('agent_configs').select('*').eq('user_id', user.id).eq('status', 'active'),
  ])

  const pendingTasks = (tasksResult.data || []).filter((t: any) => t.status === 'pending').length
  const completedTasks = (tasksResult.data || []).filter((t: any) => t.status === 'completed').length

  const dashboardData = {
    profile: profileResult.data,
    tasks: tasksResult.data || [],
    tasksTotal: tasksResult.data?.length || 0,
    pendingTasks,
    completedTasks,
    instances: instancesResult.data || [],
    activeAgents: agentsResult.data?.length || 0,
    userEmail: user.email,
  }

  return <DashboardClient data={dashboardData} />
}
