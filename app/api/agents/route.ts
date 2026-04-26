import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Default provider/model config (fallback)
const FALLBACK_PROVIDER = 'groq'
const FALLBACK_MODEL = 'llama-3.3-70b-versatile'
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 8192

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ agents: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, role, description, system_prompt, provider, model_id, temperature, max_tokens, tools } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    // Check subscription limits (max_agents)
    // Get user's plan from subscriptions table
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('workspace_user_id', userId)
      .eq('status', 'active')
      .single()

    const userPlan = subscription?.plan ?? 'personal' // Default to personal if no subscription

    // Get full plan config including default model/provider
    const { data: planConfig } = await supabaseAdmin
      .from('plan_config')
      .select('max_agents, default_model, default_provider')
      .eq('plan', userPlan)
      .single()

    // -1 means unlimited
    const maxAgents = planConfig?.max_agents ?? 3
    
    // Use plan's default model/provider, or fallback to Groq (free tier)
    const defaultProvider = planConfig?.default_provider || FALLBACK_PROVIDER
    const defaultModel = planConfig?.default_model || FALLBACK_MODEL

    const { count } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (maxAgents !== -1 && (count ?? 0) >= maxAgents) {
      return NextResponse.json({
        error: `Agent limit reached. Your ${userPlan} plan allows ${maxAgents} agent${maxAgents !== 1 ? 's' : ''}. Upgrade to create more.`
      }, { status: 403 })
    }

    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', userId)
      .single()

    const agent = {
      user_id: userId,
      workspace_id: workspace?.id ?? null,
      name: name.trim(),
      role: role || 'General',
      description: description || '',
      system_prompt: system_prompt || `You are ${name.trim()}, an AI agent. Work autonomously, prioritize tasks, and report back clearly.`,
      provider: provider || defaultProvider,
      model_id: model_id || defaultModel,
      temperature: temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: max_tokens ?? DEFAULT_MAX_TOKENS,
      tools: tools || [],
      status: 'initializing',
      sync_status: 'not_synced',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert(agent)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agent: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
