import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [profileResult, instancesResult, agentsResult, skillsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('vps_instances').select('*').eq('user_id', userId),
      supabase.from('agent_instances').select('*').eq('user_id', userId).eq('status', 'active'),
      supabase.from('user_skills').select('*').eq('user_id', userId).eq('status', 'installed'),
    ])

    return NextResponse.json({
      profile: profileResult.data,
      instances: instancesResult.data || [],
      activeAgents: agentsResult.data?.length || 0,
      installedSkills: skillsResult.data?.length || 0,
      user: { id: userId, email: profileResult.data?.email },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
