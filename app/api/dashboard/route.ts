import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profileResult, tasksResult, instancesResult, agentsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('id,status,priority,title,created_at').eq('user_id', user.id),
    supabase.from('vps_instances').select('*').eq('user_id', user.id),
    supabase.from('agent_configs').select('*').eq('user_id', user.id).eq('status', 'active'),
  ])

  const pendingTasks = (tasksResult.data || []).filter((t: any) => t.status === 'pending').length
  const completedTasks = (tasksResult.data || []).filter((t: any) => t.status === 'completed').length

  return NextResponse.json({
    profile: profileResult.data,
    tasks: tasksResult.data?.slice(0, 5) || [],
    tasksTotal: tasksResult.data?.length || 0,
    pendingTasks,
    completedTasks,
    instances: instancesResult.data || [],
    activeAgents: agentsResult.data?.length || 0,
    user: { id: user.id, email: user.email },
  })
}
