import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, personality, purpose, agentName } = body

    if (!name || !agentName) {
      return NextResponse.json({ error: 'name and agentName are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: agent, error } = await supabase
      .from('agent_instances')
      .insert({
        user_id: userId,
        agent_name: agentName,
        agent_role: purpose || name,
        status: 'active',
        config: { personality, purpose, name },
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, agent })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
