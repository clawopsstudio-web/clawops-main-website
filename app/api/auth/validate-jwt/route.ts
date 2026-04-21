import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json({ valid: false, userId: null }, { status: 401 })
  }

  const token = await getToken()

  return NextResponse.json({
    valid: true,
    userId,
    token,
  })
}
