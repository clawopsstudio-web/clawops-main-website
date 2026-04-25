/**
 * POST /api/admin/cleanup
 *
 * Demo account cleanup — fixes plan, agents, missions, chat pollution.
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

  // ── SQL-1: Fix plan badge → Business ────────────────────────────────────
  try {
    await supabase.from('profiles').upsert({ id: ADMIN_USER_ID, plan: 'business' })
    results.push('profiles.plan: set to business')
  } catch (err: any) {
    results.push(`profiles: ERROR — ${err.message}`)
  }

  // ── SQL-2: Delete duplicate agents (status='active') ─────────────────────
  try {
    const { data } = await supabase
      .from('agents')
      .select('id, name, status')
      .eq('user_id', ADMIN_USER_ID)
      .eq('status', 'active')

    if (data && data.length > 0) {
      for (const a of data) {
        await supabase.from('agents').delete().eq('id', a.id)
      }
      results.push(`agents: deleted ${data.length} duplicate 'active' rows`)
    } else {
      results.push('agents: no duplicate active rows found')
    }
  } catch (err: any) {
    results.push(`agents: ERROR — ${err.message}`)
  }

  // ── SQL-3: Delete orphaned missions ──────────────────────────────────────
  // Keep: 'Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Performance Report'
  try {
    const { data } = await supabase
      .from('missions')
      .select('id, title')
      .eq('user_id', ADMIN_USER_ID)

    if (data) {
      const KEEP_PREFIXES = ['Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Report']
      const orphaned = data.filter(m =>
        !KEEP_PREFIXES.some(p => m.title?.includes(p))
      ).map(m => m.id)

      for (const id of orphaned) {
        await supabase.from('missions').delete().eq('id', id)
      }
      results.push(`missions: ${data.length - orphaned.length} kept, ${orphaned.length} orphaned removed`)
    }
  } catch (err: any) {
    results.push(`missions: ERROR — ${err.message}`)
  }

  // ── SQL-4: Fix chat pollution ────────────────────────────────────────────
  // Delete orphaned mission-name chat entries and fix sender names
  try {
    // First delete orphaned entries
    const ORPHANED_TITLES = ['Daily Lead Digest', 'Support Ticket Monitor', 'Weekly Performance Report']
    for (const title of ORPHANED_TITLES) {
      await supabase.from('missions').delete().eq('user_id', ADMIN_USER_ID).eq('title', title)
    }

    // Fix sender_name for seeded messages
    await supabase
      .from('missions')
      .update({ sender_name: 'Ryan', avatar: 'R' })
      .eq('user_id', ADMIN_USER_ID)
      .ilike('title', '%Ryan%')

    await supabase
      .from('missions')
      .update({ sender_name: 'Arjun', avatar: 'A' })
      .eq('user_id', ADMIN_USER_ID)
      .ilike('title', '%Arjun%')

    await supabase
      .from('missions')
      .update({ sender_name: 'Helena', avatar: 'H' })
      .eq('user_id', ADMIN_USER_ID)
      .ilike('title', '%Helena%')

    results.push('chat: orphaned entries cleaned, sender names fixed')
  } catch (err: any) {
    results.push(`chat: ERROR — ${err.message}`)
  }

  // ── SQL-5: Fix provisioning state ────────────────────────────────────────
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
          dashboard_url: 'https://hermes.clawops.studio',
          vps_ip: '178.238.232.52',
          provisioned_at: new Date().toISOString(),
        })
        .eq('id', row.id)
      results.push('onboarding_submissions: active, business, hermes.clawops.studio, 178.238.232.52')
    }
  } catch (err: any) {
    results.push(`onboarding_submissions: ERROR — ${err.message}`)
  }

  // ── SQL-6: Create chat_messages table if it doesn't exist ────────────────
  try {
    // Check if chat_messages table exists
    const { error } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      // Table doesn't exist — create it via raw SQL
      results.push('chat_messages: table missing — needs creation via Supabase dashboard')
    } else {
      results.push('chat_messages: table exists')
    }
  } catch (err: any) {
    results.push(`chat_messages: check — ${err.message}`)
  }

  return NextResponse.json({ success: true, results })
}
