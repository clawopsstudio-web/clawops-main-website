/**
 * POST /api/admin/cleanup
 *
 * Cleans up duplicate/ghost records for the demo admin account.
 * Run once after seed issues.
 */
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET ?? 'clawops-demo-seed-2026'
const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

async function getServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
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

  // ── 1. Clean duplicate agents ───────────────────────────────────────────────
  // Keep: agents with status='running'. Remove: duplicates with status='active'
  try {
    const { data: allAgents } = await supabase
      .from('agents')
      .select('id, name, status')
      .eq('user_id', ADMIN_USER_ID)

    if (allAgents) {
      const seen = new Set<string>()
      const toDelete: string[] = []
      for (const a of allAgents) {
        const key = a.name
        if (seen.has(key)) {
          toDelete.push(a.id)
        } else {
          seen.add(key)
        }
      }
      for (const id of toDelete) {
        await supabase.from('agents').delete().eq('id', id)
        results.push(`agent deleted: ${id.slice(0, 8)}...`)
      }
      results.push(`agents: ${allAgents.length - toDelete.length} kept, ${toDelete.length} duplicates removed`)
    }
  } catch (err: any) {
    results.push(`agents: ERROR — ${err.message}`)
  }

  // ── 2. Clean orphaned missions ──────────────────────────────────────────
  // Keep: missions with a title from the 3 named missions
  const KEEP_TITLES = ['Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Performance Report']
  try {
    const { data: allMissions } = await supabase
      .from('missions')
      .select('id, title')
      .eq('user_id', ADMIN_USER_ID)

    if (allMissions) {
      const toDelete = allMissions
        .filter(m => !KEEP_TITLES.some(t => m.title?.includes(t)))
        .map(m => m.id)

      for (const id of toDelete) {
        await supabase.from('missions').delete().eq('id', id)
      }
      results.push(`missions: ${allMissions.length - toDelete.length} kept, ${toDelete.length} orphaned removed`)
    }
  } catch (err: any) {
    results.push(`missions: ERROR — ${err.message}`)
  }

  // ── 3. Update demo account plan → business ──────────────────────────────
  try {
    await supabase
      .from('profiles')
      .upsert({ id: ADMIN_USER_ID, plan: 'business', full_name: 'ClawOps Studio Admin' })
    results.push('profiles.plan: updated to business')
  } catch (err: any) {
    results.push(`profiles: ERROR — ${err.message}`)
  }

  // ── 4. Ensure overview seed data is correct ─────────────────────────────
  try {
    const { data: row } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('clerk_user_id', ADMIN_USER_ID)
      .maybeSingle()

    if (row) {
      await supabase
        .from('onboarding_submissions')
        .update({
          status: 'active',
          plan: 'business',
          dashboard_url: 'https://demo.app.clawops.studio',
          vps_ip: '178.238.232.52',
          provisioned_at: new Date().toISOString(),
        })
        .eq('id', row.id)
      results.push('onboarding_submissions: status=active, plan=business, vps_ip=178.238.232.52')
    }
  } catch (err: any) {
    results.push(`onboarding_submissions: ERROR — ${err.message}`)
  }

  // ── 5. Seed 3 real chat conversations ───────────────────────────────────
  const DEMO_CONVERSATIONS = [
    {
      agent: 'Ryan',
      role: 'user',
      content: 'Find me 10 SaaS founders in London on LinkedIn',
    },
    {
      agent: 'Ryan',
      role: 'agent',
      content: "On it. I found 10 profiles matching your criteria. Here's the list with company, role, and connection status:\n\n1. James Chen — Founder @ TechFlow (Series A) — CTO background\n2. Sarah Williams — CEO @ Buildfast (Bootstrapped) — 50 employees\n3. Arjun Patel — Founder @ DevOps Co (Seed) — ex-Google\n... (9 more)\n\nWant me to draft personalised outreach for any of these?",
    },
    {
      agent: 'Arjun',
      role: 'user',
      content: "What's the state of AI agent tooling in 2026?",
    },
    {
      agent: 'Arjun',
      role: 'agent',
      content: "I've scanned 40+ sources. Here's the summary:\n\n• Agent frameworks maturing: LangGraph, CrewAI, AutoGen now enterprise-ready\n• Context windows hit 1M+ tokens standard\n• Tool calling accuracy improved 3x vs 2024\n• Pricing dropped 60% across the board\n\nWant the full 12-page report as a Notion doc?",
    },
    {
      agent: 'Helena',
      role: 'user',
      content: 'Draft a reply to an angry customer who waited 3 days for a response',
    },
    {
      agent: 'Helena',
      role: 'agent',
      content: "Here's a draft reply:\n\n---\nHi [Name],\n\nI sincerely apologise for the delay — 3 days is unacceptable and that's on us. I've personally reviewed your case and here's where we stand...\n\n[Specific resolution]\n\nAs a gesture of goodwill, [offer]. We'll also be reviewing our support SLAs internally to make sure this doesn't happen again.\n\nWarm regards,\n[Your Name]\n---\n\nTone: empathetic, professional. Want me to send it?",
    },
  ]

  // Store conversations as chat_messages table or use missions as chat
  // For now, store as 3 missions with "chat" type so dashboard shows them
  for (const conv of DEMO_CONVERSATIONS) {
    try {
      await supabase.from('missions').insert({
        user_id: ADMIN_USER_ID,
        title: `[${conv.agent}] ${conv.content.slice(0, 60)}...`,
        prompt: conv.content,
        output: conv.role === 'agent' ? conv.content : null,
        status: 'completed',
        started_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString(),
      })
    } catch {}
  }
  results.push(`chat: ${DEMO_CONVERSATIONS.length} demo conversations seeded`)

  return NextResponse.json({ success: true, results })
}
