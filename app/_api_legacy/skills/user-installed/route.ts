import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import catalogData from '@/data/skills-catalog.json'


// GET: List user's installed skills
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { data: userSkills, error } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    // Graceful degradation — return empty list if table not available
    return NextResponse.json({ installed: [], catalog: catalogData.skills })
  }

  // Enrich with catalog data
  const installed = (userSkills || []).map(us => {
    const catalogSkill = catalogData.skills.find(s => s.slug === us.skill_id)
    return {
      ...catalogSkill,
      install_status: us.status,
      config_data: us.config_data,
      installed_at: us.installed_at,
    }
  }).filter(Boolean)

  return NextResponse.json({ installed, catalog: catalogData.skills })
}
