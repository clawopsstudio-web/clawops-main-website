import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const LLM_PROVIDERS = ['openai', 'anthropic', 'google-ai', 'groq']
const CHANNEL_PROVIDERS = ['ghl', 'telegram', 'whatsapp', 'discord', 'slack']

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: keys } = await supabase.from('user_integrations').select('*').eq('user_id', userId)

    return NextResponse.json({ apiKeys: keys || [], channels: [] })
  } catch (e) {
    console.error('[/api/integrations GET]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { integrationId, credentials } = body

    if (!integrationId || typeof integrationId !== 'string') {
      return NextResponse.json({ error: 'integrationId required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        provider: integrationId,
        credentials,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, integrationId })

  } catch (e) {
    console.error('[/api/integrations POST]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')

    if (!integrationId) {
      return NextResponse.json({ error: 'integrationId required' }, { status: 400 })
    }

    await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', integrationId)

    return NextResponse.json({ success: true })

  } catch (e) {
    console.error('[/api/integrations DELETE]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
