import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ authenticated: false, userId: null })
  }

  return NextResponse.json({
    authenticated: true,
    userId,
  })
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)

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
