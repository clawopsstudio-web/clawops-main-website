/**
 * POST /api/ssh/exec
 * Body: { cmd: string }
 * Runs whitelisted SSH command, returns stdout/stderr
 */
import { NextRequest, NextResponse } from 'next/server'
import { execSSH } from '@/lib/vps-ssh'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { userId } = req.headers.get('x-clerk-user-id')
    ? { userId: req.headers.get('x-clerk-user-id') }
    : { userId: '' }

  if (!userId) {
    return NextResponse.json({ stdout: '', stderr: 'Unauthorized', exitCode: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { cmd } = body

  if (!cmd?.trim()) {
    return NextResponse.json({ stdout: '', stderr: 'No command', exitCode: 1 })
  }

  try {
    const result = await execSSH(userId!, cmd)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ stdout: '', stderr: e.message, exitCode: 1 })
  }
}
