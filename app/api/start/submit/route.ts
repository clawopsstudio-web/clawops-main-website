/**
 * app/api/start/submit/route.ts
 * Submit onboarding form
 * Auth: Supabase session cookie
 * POST { ...formData }
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Get user ID from session cookie (Supabase auth)
    let userId: string | null = null
    try {
      const { createServerClient } = await import('@supabase/ssr')
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) { return req.cookies.get(name)?.value },
            set(_n: string, _v: string, _o: any) {},
            remove(_n: string, _o: any) {},
          },
        }
      )
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id ?? null
    } catch {}

    // Accept userId from body (for form pre-fill) OR from session
    const clerk_user_id = body.clerk_user_id || userId

    // Basic validation
    if (!body.full_name || !body.business_name || !body.industry) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, business_name, industry' },
        { status: 400 }
      )
    }

    // Check if already submitted
    if (clerk_user_id) {
      const { data: existing } = await supabaseAdmin
        .from('onboarding_submissions')
        .select('id')
        .eq('clerk_user_id', clerk_user_id)
        .maybeSingle()
      if (existing) {
        return NextResponse.json(
          { error: 'You have already submitted the onboarding form', existingId: existing.id },
          { status: 409 }
        )
      }
    }

    // Insert
    const { data, error } = await supabaseAdmin
      .from('onboarding_submissions')
      .insert({
        full_name: body.full_name,
        business_name: body.business_name,
        website_url: body.website_url || null,
        industry: body.industry,
        business_description: body.business_description || null,
        clerk_user_id,
        goals: body.goals || [],
        tools_crm: body.tools_crm || [],
        tools_email: body.tools_email || [],
        tools_comms: body.tools_comms || [],
        tools_workspace: body.tools_workspace || [],
        tools_social: body.tools_social || [],
        agent_name: body.agent_name || null,
        agent_tone: body.agent_tone || null,
        plan: body.plan || 'personal',
        status: 'pending_payment',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    console.error('[submit]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
