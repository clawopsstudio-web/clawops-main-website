import { NextResponse } from 'next/server'
import { provisionVPS } from '@/lib/contabo'

export async function GET() {
  try {
    const result = await provisionVPS({ userId: 'test-direct', plan: 'personal' })
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
