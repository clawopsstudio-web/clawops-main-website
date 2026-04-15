import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getUserIdFromToken,
  getAllIntegrations,
  saveApiKey,
  deleteApiKey,
  saveChannelConfig,
  deleteChannelConfig,
} from '@/lib/supabase/integrations'

// Map our integration IDs to DB columns
const LLM_PROVIDERS = ['openai', 'anthropic', 'google-ai', 'groq']
const CHANNEL_PROVIDERS = ['ghl', 'telegram', 'whatsapp', 'discord', 'slack']

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { apiKeys, channels } = await getAllIntegrations(userId)
    return NextResponse.json({ apiKeys, channels })
  } catch (e) {
    console.error('[/api/integrations GET]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const body = await request.json()
    const { integrationId, credentials } = body

    if (!integrationId || typeof integrationId !== 'string') {
      return NextResponse.json({ error: 'integrationId required' }, { status: 400 })
    }
    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json({ error: 'credentials required' }, { status: 400 })
    }

    let result: { success: boolean; error?: string }

    if (LLM_PROVIDERS.includes(integrationId)) {
      // LLM API key
      const apiKey = credentials.api_key || credentials.apiKey
      if (!apiKey) return NextResponse.json({ error: 'api_key required' }, { status: 400 })
      result = await saveApiKey(userId, integrationId, apiKey, credentials.label)
    } else if (CHANNEL_PROVIDERS.includes(integrationId)) {
      // Messaging channel config
      result = await saveChannelConfig(userId, integrationId, credentials)
    } else {
      return NextResponse.json({ error: `Unknown integration: ${integrationId}` }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, integrationId })
  } catch (e) {
    console.error('[/api/integrations POST]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')

    if (!integrationId) {
      return NextResponse.json({ error: 'integrationId required' }, { status: 400 })
    }

    if (LLM_PROVIDERS.includes(integrationId)) {
      await deleteApiKey(userId, integrationId)
    } else if (CHANNEL_PROVIDERS.includes(integrationId)) {
      await deleteChannelConfig(userId, integrationId)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[/api/integrations DELETE]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
