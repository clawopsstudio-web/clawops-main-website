import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ valid: false, userId: null }, { status: 401 })
  }

  return NextResponse.json({
    valid: true,
    userId,
    token: null,
  })
}
