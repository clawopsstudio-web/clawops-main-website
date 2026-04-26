/**
 * lib/vps-ssh-test.ts
 * Direct SSH client for the ClawOps test VPS.
 * Used ONLY by admin API routes (never exposed to browser).
 * All commands are whitelisted.
 */
import { NodeSSH } from 'node-ssh'

// ─── Test VPS credentials ────────────────────────────────────────
export const TEST_VPS = {
  ip: process.env.TEST_VPS_IP ?? '178.238.232.52',
  password: process.env.TEST_VPS_PASSWORD ?? 'NewRootPass2026!',
  port: 22,
  username: 'root',
}

// ─── Command whitelist ─────────────────────────────────────────────
const ALLOWED_COMMANDS = new Set([
  'systemctl status hermes-web.service --no-pager',
  'df -h',
  'free -h',
  'hermes doctor',
  'journalctl -u hermes-web.service -n 20',
  'systemctl restart hermes-web.service',
  'systemctl restart openclaw',
  'systemctl status openclaw --no-pager',
  'tail -n 20 /var/log/hermes.log',
  'cat /proc/loadavg',
  'uptime',
])

function isAllowed(cmd: string): boolean {
  return ALLOWED_COMMANDS.has(cmd.trim())
}

// ─── Parse systemctl status output ────────────────────────────────
export function parseHermesStatus(output: string): {
  running: boolean
  activeState: string
  subState: string
  pid: string | null
  uptime: string | null
} {
  const lines = output.split('\n')
  let activeState = ''
  let subState = ''
  let pid: string | null = null

  for (const line of lines) {
    if (line.includes('Active:')) activeState = line.trim()
    const pidMatch = line.match(/Main PID:\s*(\d+)/)
    if (pidMatch) pid = pidMatch[1]
  }

  const running = activeState.includes('active (running)')
  return { running, activeState, subState, pid, uptime: null }
}

// ─── Parse df -h output ────────────────────────────────────────────
export function parseDisk(output: string): { used: string; available: string; percent: number } {
  const lines = output.split('\n')
  // Find the root mount line — df -h columns are separated by spaces
  for (const line of lines) {
    if (line.trim().startsWith('/dev/')) {
      const parts = line.trim().split(/\s+/)
      const mount = parts[parts.length - 1] // last field = mount point
      if (mount === '/') {
        return {
          used: parts[2] ?? '-',
          available: parts[3] ?? '-',
          percent: parseInt((parts[4] ?? '0').replace('%', ''), 10),
        }
      }
    }
  }
  return { used: '-', available: '-', percent: 0 }
}

// ─── Parse free -h output ──────────────────────────────────────────
export function parseMemory(output: string): { total: string; used: string; free: string; percent: number } {
  const lines = output.split('\n')
  for (const line of lines) {
    if (line.startsWith('Mem:')) {
      const parts = line.split(/\s+/)
      const total = parts[1] ?? '-'
      const used = parts[2] ?? '-'
      const free = parts[3] ?? '-'
      // Calculate percent from raw values if available
      return { total, used, free, percent: 0 }
    }
  }
  return { total: '-', used: '-', free: '-', percent: 0 }
}

// ─── Execute SSH command ───────────────────────────────────────────
export async function execSSHCommand(
  cmd: string,
  timeoutMs = 30_000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  if (!isAllowed(cmd)) {
    throw new Error(`Command not whitelisted: ${cmd}`)
  }

  const ssh = new NodeSSH()
  try {
    await ssh.connect({
      host: TEST_VPS.ip,
      port: TEST_VPS.port,
      username: TEST_VPS.username,
      password: TEST_VPS.password,
      readyTimeout: 10_000,
    })

    const result = await ssh.execCommand(cmd, {
      execTimeout: timeoutMs,
    } as any)

    return {
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
      exitCode: Number(result.code ?? 0),
    }
  } finally {
    ssh.dispose()
  }
}
