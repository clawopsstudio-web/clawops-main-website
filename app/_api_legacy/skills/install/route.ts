import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import catalogData from '@/data/skills-catalog.json'


// GET: Get install command for a skill
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const skill = catalogData.skills.find(s => s.slug === slug)
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  return NextResponse.json({
    slug: skill.slug,
    name: skill.name,
    install_method: skill.install_method,
    install_command: skill.install_command,
    install_path: skill.install_path,
    prerequisites: skill.prerequisites,
    config_fields: skill.config_fields,
  })
}

// POST: Save/install a skill (marks as installed in Supabase)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, user_id, status = 'installed', config_data = {} } = body

    if (!slug || !user_id) {
      return NextResponse.json({ error: 'slug and user_id are required' }, { status: 400 })
    }

    const skill = catalogData.skills.find(s => s.slug === slug)
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Upsert into user_skills
    const { data, error } = await supabase
      .from('user_skills')
      .upsert({
        user_id,
        skill_id: slug, // store slug as the identifier
        status,
        config_data,
        installed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,skill_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // If Supabase fails, return success anyway (graceful degradation)
      return NextResponse.json({
        success: true,
        skill: skill.slug,
        install_command: skill.install_command,
        warning: 'Status tracking unavailable — run install command manually',
      })
    }

    return NextResponse.json({
      success: true,
      skill: skill.slug,
      name: skill.name,
      status: data?.status || status,
      install_command: skill.install_command,
      config_fields: skill.config_fields,
    })
  } catch (err) {
    console.error('POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
