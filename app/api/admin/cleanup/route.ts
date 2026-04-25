/**
 * POST /api/admin/cleanup
 *
 * Demo account cleanup — fixes plan, agents, missions, chat.
 * Run once. Idempotent.
 */
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET ?? 'clawops-demo-seed-2026'
const DEMO_UID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'
const NO_AGENT = '00000000-0000-0000-0000-000000000000'

async function getServiceClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.secret !== ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await getServiceClient()
  const results: string[] = []

  // ── 1. Ensure demo agents exist with correct status ──────────────────────
  try {
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, status')
      .eq('user_id', DEMO_UID)

    const byName = new Map(agents?.map(a => [a.name, a]) ?? [])
    const TARGET_AGENTS = [
      { name: 'Ryan', status: 'running' },
      { name: 'Arjun', status: 'running' },
      { name: 'Helena', status: 'running' },
    ]

    for (const target of TARGET_AGENTS) {
      const existing = byName.get(target.name)
      if (existing) {
        await supabase.from('agents').update({ status: 'running' }).eq('id', existing.id)
        results.push(`agent ${target.name}: status → running`)
      } else {
        await supabase.from('agents').insert({ user_id: DEMO_UID, name: target.name, status: 'running' })
        results.push(`agent ${target.name}: created`)
      }
    }

    // Delete any agent with name NOT in target list
    const keepNames = TARGET_AGENTS.map(t => t.name)
    const toDelete = (agents ?? []).filter(a => !keepNames.includes(a.name))
    for (const a of toDelete) {
      await supabase.from('agents').delete().eq('id', a.id)
      results.push(`agent ${a.name}: deleted`)
    }
  } catch (err: any) {
    results.push(`agents: ERROR — ${err.message}`)
  }

  // ── 2. Clean polluted missions ───────────────────────────────────────────
  try {
    const { data: missions } = await supabase
      .from('missions')
      .select('id, title')
      .eq('user_id', DEMO_UID)

    if (missions) {
      // Delete entries that are agent responses (title starts with [Agent] or [Ryan/Arjun/Helena])
      const polluted = missions.filter(m =>
        /^\[(Ryan|Arjun|Helena|Agent)\]/.test(m.title ?? '')
      )
      // Delete mission names that are seed entries repeated
      const seedNames = ['Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Performance Report']
      const orphaned = missions.filter(m =>
        !polluted.includes(m) && !seedNames.some(n => m.title?.includes(n))
      )
      const allToDelete = [...polluted, ...orphaned]
      for (const m of allToDelete) {
        await supabase.from('missions').delete().eq('id', m.id)
      }
      results.push(`missions: ${missions.length - allToDelete.length} kept, ${allToDelete.length} polluted/orphaned deleted`)
    }
  } catch (err: any) {
    results.push(`missions: ERROR — ${err.message}`)
  }

  // ── 3. Clean polluted chat_messages ──────────────────────────────────────
  try {
    // Delete entries that look like mission titles or agent responses
    await supabase.from('chat_messages')
      .delete()
      .eq('user_id', DEMO_UID)
      .in('content', [
        'Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Performance Report',
        'Henry schema check 2',
      ])

    // Delete entries with content starting with "[Ryan]", "[Arjun]", "[Helena]"
    const { data: all } = await supabase
      .from('chat_messages')
      .select('id, content')
      .eq('user_id', DEMO_UID)

    if (all) {
      const bad = all.filter(m =>
        /^\[(Ryan|Arjun|Helena|Agent)\]/.test(m.content ?? '')
        || m.content === 'Henry schema check 2'
      )
      for (const m of bad) {
        await supabase.from('chat_messages').delete().eq('id', m.id)
      }
      results.push(`chat_messages: cleaned ${bad.length} polluted entries`)
    }
  } catch (err: any) {
    results.push(`chat_messages: ERROR — ${err.message}`)
  }

  // ── 4. Seed 3 real demo conversations into chat_messages ─────────────────
  const now = new Date()
  const DEMO_CONVOS = [
    {
      agent_id: NO_AGENT, agent_name: 'Ryan', avatar: 'R',
      messages: [
        { role: 'user', sender_name: 'You', avatar: 'Y', content: 'Ryan, find me 10 SaaS founders in London on LinkedIn' },
        { role: 'assistant', sender_name: 'Ryan', avatar: 'R', content: "On it. Found 10 profiles matching your criteria:\n\n1. James Chen — Founder @ TechFlow (Series A) — ex-Google\n2. Sarah Williams — CEO @ Buildfast (Bootstrapped) — 50 employees\n3. Arjun Patel — Founder @ DevOps Co (Seed) — ex-Amazon\n...\n\nWant me to draft personalised outreach for any of these?" },
      ],
    },
    {
      agent_id: NO_AGENT, agent_name: 'Arjun', avatar: 'A',
      messages: [
        { role: 'user', sender_name: 'You', avatar: 'Y', content: "What's the state of AI agent tooling in 2026?" },
        { role: 'assistant', sender_name: 'Arjun', avatar: 'A', content: "I've scanned 40+ sources. Key findings:\n\n• Agent frameworks maturing: LangGraph, CrewAI, AutoGen now enterprise-ready\n• Context windows hit 1M+ tokens standard\n• Tool calling accuracy improved 3x vs 2024\n• Pricing dropped 60% across the board\n• Open-source models competitive with GPT-4 for 90% of tasks\n\nFull report as a Notion doc?" },
      ],
    },
    {
      agent_id: NO_AGENT, agent_name: 'Helena', avatar: 'H',
      messages: [
        { role: 'user', sender_name: 'You', avatar: 'Y', content: 'Helena, draft a reply to an angry customer who waited 3 days for a response' },
        { role: 'assistant', sender_name: 'Helena', avatar: 'H', content: "Here's a draft reply:\n\n---\nHi [Name],\n\nI sincerely apologise for the delay — 3 days is unacceptable and that's on us. I've personally reviewed your case and here's where we stand...\n\n[Specific resolution]\n\nAs a gesture of goodwill, [offer]. We'll also review our support SLAs internally.\n\nWarm regards,\n[Your Name]\n---\n\nTone: empathetic, professional. Want me to send it?" },
      ],
    },
  ]

  try {
    let seeded = 0
    for (const convo of DEMO_CONVOS) {
      for (let i = 0; i < convo.messages.length; i++) {
        const offset = i * 60000 // 1 min apart
        await supabase.from('chat_messages').insert({
          user_id: DEMO_UID,
          agent_id: convo.agent_id,
          role: convo.messages[i].role,
          sender_name: convo.messages[i].sender_name,
          avatar: convo.messages[i].avatar,
          content: convo.messages[i].content,
          created_at: new Date(now.getTime() - offset).toISOString(),
        })
        seeded++
      }
    }
    results.push(`chat_messages: seeded ${seeded} demo messages (3 conversations)`)
  } catch (err: any) {
    results.push(`chat_messages seed: ERROR — ${err.message}`)
  }

  // ── 5. Fix plan → business ────────────────────────────────────────────────
  try {
    await supabase.from('profiles').upsert({ id: DEMO_UID, plan: 'business' })
    results.push('profiles.plan: set to business')
  } catch (err: any) {
    results.push(`profiles: ERROR — ${err.message}`)
  }

  // ── 6. Fix provisioning state ─────────────────────────────────────────────
  try {
    const { data: row } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('clerk_user_id', DEMO_UID)
      .maybeSingle()

    if (row) {
      await supabase.from('onboarding_submissions').update({
        status: 'active',
        plan: 'business',
        dashboard_url: 'https://hermes.clawops.studio',
        vps_ip: '178.238.232.52',
      }).eq('id', row.id)
      results.push('onboarding_submissions: active, business')
    }
  } catch (err: any) {
    results.push(`onboarding_submissions: ${err.message}`)
  }

  return NextResponse.json({ success: true, results })
}
