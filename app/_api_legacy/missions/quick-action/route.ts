/**
 * app/api/missions/quick-action/route.ts
 * POST /api/missions/quick-action
 *
 * Body: { action: 'vps-status' | 'hermes-doctor' | 'sync-agents' | 'restart' | 'logs' }
 * Returns: { output: string, success: boolean, error?: string }
 *
 * Each action maps to a whitelisted SSH command on the test VPS.
 * Never exposes SSH to browser — all execution is server-side.
 */
import { NextRequest, NextResponse } from 'next/server'
import { execSSHCommand } from '@/lib/vps-ssh-test'

export const runtime = 'nodejs'

type Action =
  | 'vps-status'
  | 'hermes-doctor'
  | 'sync-agents'
  | 'restart'
  | 'logs'

// ─── Action → SSH command mapping ─────────────────────────────────
const ACTION_COMMANDS: Record<Action, { cmd: string; description: string; timeoutMs?: number }> = {
  'vps-status': {
    description: 'System health check',
    cmd: 'systemctl status hermes-web.service --no-pager && echo "---DISK---" && df -h && echo "---MEM---" && free -h',
    timeoutMs: 20_000,
  },
  'hermes-doctor': {
    description: 'Hermes health check',
    cmd: 'hermes doctor',
    timeoutMs: 30_000,
  },
  'sync-agents': {
    description: 'Push agent configs to VPS',
    cmd: 'echo "Sync agents: placeholder — no agents configured"',
    timeoutMs: 10_000,
  },
  'restart': {
    description: 'Restart Hermes gateway service',
    cmd: 'systemctl restart hermes-web.service && sleep 3 && systemctl status hermes-web.service --no-pager',
    timeoutMs: 40_000,
  },
  'logs': {
    description: 'Recent Hermes logs',
    cmd: 'journalctl -u hermes-web.service -n 30 --no-pager',
    timeoutMs: 20_000,
  },
}

// ─── Validate action ───────────────────────────────────────────────
function isValidAction(a: string): a is Action {
  return Object.prototype.hasOwnProperty.call(ACTION_COMMANDS, a)
}

export async function POST(req: NextRequest) {
  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ output: '', success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { action } = body

  if (!action || !isValidAction(action)) {
    return NextResponse.json({
      output: '',
      success: false,
      error: `Unknown action: "${action}". Valid actions: ${Object.keys(ACTION_COMMANDS).join(', ')}`,
    }, { status: 400 })
  }

  const { cmd, description, timeoutMs } = ACTION_COMMANDS[action]

  try {
    const result = await execSSHCommand(cmd, timeoutMs ?? 30_000)
    const combined = result.stdout + (result.stderr ? '\n[STDERR]\n' + result.stderr : '')
    return NextResponse.json({
      output: combined.trim() || '(no output)',
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      action,
      description,
    })
  } catch (err: any) {
    console.error(`[/api/missions/quick-action] action=${action}`, err)
    return NextResponse.json({
      output: '',
      success: false,
      error: err.message ?? 'SSH execution failed',
      action,
      description,
    })
  }
}
