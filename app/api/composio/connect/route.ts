import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { getOAuthRedirectUrl } from '@/lib/composio'

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appName } = await req.json()
  if (!appName) return NextResponse.json({ error: 'appName required' }, { status: 400 })

  try {
    const redirectUrl = await getOAuthRedirectUrl(userId, appName)
    return NextResponse.json({ connectUrl: redirectUrl })
  } catch (err: any) {
    console.error('[composio/connect]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
