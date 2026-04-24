/**
 * POST /api/admin/seed
 *
 * INTERNAL ONLY — Seeds demo data for the admin account.
 * Must be called once after env vars are configured.
 *
 * Creates:
 *   - onboarding_submissions row (admin account → active, pre-provisioned)
 *   - agents: Ryan (Sales), Arjun (Research), Helena (Support)
 *   - missions: 3 demo missions
 *   - logs: 15 realistic log entries
 *
 * Body: { secret: string } — must match ADMIN_SEED_SECRET
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET ?? 'clawops-demo-seed-2026'
const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

async function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await getServiceClient()

  const results: string[] = []

  // ── 1. Onboarding submission (marks admin as active/pre-provisioned) ──────
  try {
    // First try to find existing row
    const { data: existing } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('clerk_user_id', ADMIN_USER_ID)
      .maybeSingle()

    const row: Record<string, string> = {
      clerk_user_id: ADMIN_USER_ID,
      full_name: 'ClawOps Studio Admin',
      business_name: 'ClawOps Studio',
      agent_name: 'ClawOps Admin',
      plan: 'enterprise',
      status: 'active',
      dashboard_url: 'https://demo.app.clawops.studio',
      vps_ip: '178.238.232.52',
      paid_at: new Date().toISOString(),
      provisioned_at: new Date().toISOString(),
    }
    // vps_ip may not exist yet — only add if the column is present
    // (will be added via schema migration when Pulkit runs the SQL)

    let error
    if (existing) {
      const result = await supabase
        .from('onboarding_submissions')
        .update(row)
        .eq('id', existing.id)
      error = result.error
    } else {
      const result = await supabase
        .from('onboarding_submissions')
        .insert(row)
      error = result.error
    }

    if (error) throw error
    results.push('onboarding_submissions: seeded')
  } catch (err: any) {
    results.push(`onboarding_submissions: ERROR — ${err.message}`)
  }

  // ── 2. Demo agents ─────────────────────────────────────────────────────
  const agents = [
    {
      user_id: ADMIN_USER_ID,
      name: 'Ryan',
      role: 'Sales Agent',
      status: 'active',
      system_prompt: 'You are Ryan, the Sales Agent for ClawOps Studio. Your job is to find and qualify leads, enrich LinkedIn profiles, and draft outreach messages. You work autonomously and report progress daily.',
    },
    {
      user_id: ADMIN_USER_ID,
      name: 'Arjun',
      role: 'Research Agent',
      status: 'active',
      system_prompt: 'You are Arjun, the Research Agent for ClawOps Studio. Your job is to conduct deep web research, analyze competitors, summarize sources, and deliver actionable reports. You are thorough and cite your sources.',
    },
    {
      user_id: ADMIN_USER_ID,
      name: 'Helena',
      role: 'Support Agent',
      status: 'active',
      system_prompt: 'You are Helena, the Support Agent for ClawOps Studio. Your job is to handle inbound support tickets, draft replies, escalate edge cases, and keep customers happy. You are empathetic and professional.',
    },
  ]

  for (const agent of agents) {
    try {
      // Delete existing agent with same name for this user, then re-insert
      await supabase.from('agents').delete().eq('user_id', ADMIN_USER_ID).eq('name', agent.name)
      const { error } = await supabase.from('agents').insert(agent)
      if (error) throw error
      results.push(`agent: ${agent.name} — seeded`)
    } catch (err: any) {
      results.push(`agent: ${agent.name} — ERROR: ${err.message}`)
    }
  }

  // ── 3. Demo missions ───────────────────────────────────────────────────
  const now = Date.now()
  const missions = [
    {
      user_id: ADMIN_USER_ID,
      title: 'Daily Lead Digest',
      prompt: 'Find and qualify 10 promising SaaS startups from Product Hunt and LinkedIn. Enrich with company data, send summary to Telegram.',
      output: 'Found 10 qualified leads. Top picks: Buildflow, Airplane.dev, Encore. Summary sent to Telegram.',
      status: 'completed',
      started_at: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(now - 7.9 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: ADMIN_USER_ID,
      title: 'Support Ticket Monitor',
      prompt: 'Monitor Gmail inbox for new support tickets. Draft replies, escalate complex issues to human.',
      output: 'Monitored 5 new tickets. 3 resolved automatically, 2 escalated.',
      status: 'completed',
      started_at: new Date(now - 28 * 60 * 1000).toISOString(),
      completed_at: new Date(now - 27 * 60 * 1000).toISOString(),
    },
    {
      user_id: ADMIN_USER_ID,
      title: 'Weekly Performance Report',
      prompt: 'Generate a weekly performance summary: leads contacted, tickets resolved, research completed.',
      output: 'Weekly report generated. 47 leads contacted, 23 qualified, 18 tickets resolved.',
      status: 'completed',
      started_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(now - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
    },
  ]

  for (const mission of missions) {
    try {
      const { error } = await supabase.from('missions').insert(mission)
      if (error) throw error
      results.push(`mission: ${mission.title} — seeded`)
    } catch (err: any) {
      results.push(`mission: ${mission.title} — ERROR: ${err.message}`)
    }
  }

  // ── 4. Demo logs ──────────────────────────────────────────────────────
  const logs = [
    { agent: 'Ryan', message: 'Qualified lead: techflow.io (Series A, 50 employees)', level: 'info' },
    { agent: 'Arjun', message: 'Research task completed in 38 seconds. 12 sources analyzed.', level: 'info' },
    { agent: 'Helena', message: 'Ticket #1247 resolved. Customer replied: "Thanks, this is perfect!"', level: 'info' },
    { agent: 'System', message: 'Composio integration Gmail connected successfully', level: 'info' },
    { agent: 'System', message: 'Mission "Daily Digest" completed. 20 emails sent.', level: 'info' },
    { agent: 'Ryan', message: '20 outreach emails sent successfully via Gmail', level: 'info' },
    { agent: 'Arjun', message: '8 competitors analyzed. Top finding: competitors charge 2x for similar features', level: 'info' },
    { agent: 'Helena', message: '5 tickets escalated to human (complex billing issues)', level: 'info' },
    { agent: 'Ryan', message: 'LinkedIn profile enrichment complete. 15 new decision-makers identified.', level: 'info' },
    { agent: 'Arjun', message: 'SLOW: Web search took 8 seconds (rate limited by search provider)', level: 'warn' },
    { agent: 'System', message: 'Composio rate limit at 80%. Consider upgrading plan.', level: 'warn' },
    { agent: 'Ryan', message: 'LinkedIn profile fetch failed (rate limited). Retrying in 60s.', level: 'error' },
    { agent: 'System', message: 'Composio integration Slack disconnected (reconnecting...)', level: 'error' },
    { agent: 'Helena', message: 'Ticket #1299 escalated: requires refund approval from billing team', level: 'info' },
    { agent: 'Ryan', message: 'CRM updated with 30 new contacts from today\'s research', level: 'info' },
    { agent: 'Arjun', message: 'Market report "Q2 SaaS Trends" generated (4 pages)', level: 'info' },
    { agent: 'System', message: 'VPS health check passed. All services nominal.', level: 'info' },
    { agent: 'Helena', message: 'Auto-reply sent to ticket #1301. Customer satisfaction: 4.8/5', level: 'info' },
    { agent: 'Ryan', message: 'Daily report: 47 emails sent, 12 replies received, 3 meetings booked', level: 'info' },
    { agent: 'Arjun', message: 'Competitor monitoring: 3 pricing changes detected this week', level: 'info' },
  ]

  for (const log of logs) {
    try {
      const { error } = await supabase.from('logs').insert({
        agent: log.agent,
        message: log.message,
        level: log.level,
        created_at: new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (error) throw error
    } catch {
      // Non-fatal
    }
  }
  results.push(`logs: ${logs.length} entries seeded`)

  return NextResponse.json({
    success: true,
    admin_user_id: ADMIN_USER_ID,
    results,
  })
}
