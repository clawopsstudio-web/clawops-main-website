import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side Supabase client (service role — bypasses RLS for writes)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      full_name,
      business_name,
      website_url,
      industry,
      business_description,
      goals,
      tools_crm,
      tools_email,
      tools_comms,
      tools_workspace,
      tools_social,
      agent_name,
      agent_tone,
      plan,
      clerk_user_id,
    } = body

    // Basic validation
    if (!full_name || !business_name || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, business_name, industry' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('onboarding_submissions')
      .insert({
        full_name,
        business_name,
        website_url: website_url || null,
        industry,
        business_description: business_description || null,
        clerk_user_id: clerk_user_id || null,
        goals: goals || [],
        tools_crm: tools_crm || [],
        tools_email: tools_email || [],
        tools_comms: tools_comms || [],
        tools_workspace: tools_workspace || [],
        tools_social: tools_social || [],
        agent_name: agent_name || null,
        agent_tone: agent_tone || null,
        plan: plan || 'personal',
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
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
