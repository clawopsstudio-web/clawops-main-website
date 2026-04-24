import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { url } = body

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // Fetch and analyze the URL
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ClawOps-Research-Bot/1.0' }
    })
    const html = await response.text()

    // Simple analysis
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
    const h1s = (html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []).map(h => h.replace(/<[^>]+>/g, ''))

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Log the analysis
    await supabase.from('mission_logs').insert({
      user_id: userId,
      mission_type: 'analyze',
      status: 'completed',
      input_data: { url },
      output_data: { title: titleMatch?.[1], description: descriptionMatch?.[1], h1s },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      title: titleMatch?.[1] || null,
      description: descriptionMatch?.[1] || null,
      h1s,
      analyzed: true,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
