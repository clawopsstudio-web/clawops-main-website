import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId, sessionId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ authenticated: false, userId: null })
  }

  const clerkToken = await getToken()

  return NextResponse.json({
    authenticated: true,
    userId,
    sessionId,
    // Pass Clerk token for any backend verification
    token: clerkToken,
  })
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'get-profile') {
    // Fetch user profile from Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  }

  return NextResponse.json({ userId })
}
