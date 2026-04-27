/**
 * lib/vps-ssh.ts
 * SSH utility for Hermes VPS control
 * Security: command whitelist, rate limiting, Supabase logging
 */

import { NodeSSH } from 'node-ssh'
import { createClient } from '@supabase/supabase-js'

// ─── Whitelist ─────────────────────────────────────────────────────
const WHITELIST = new Set([
  'hermes --version', 'hermes --help', 'hermes doctor',
  'systemctl restart hermes', 'systemctl status hermes',
  'systemctl stop hermes', 'systemctl start hermes',
  'hermes update', 'hermes cache clear',
  'df -h', 'free -h', 'top -bn1',
  'tail -100 /root/.hermes/logs/hermes.log',
  'tail -50 /root/.hermes/logs/agent.log',
  'tail -f /root/.hermes/logs/hermes.log',
  'curl -s http://127.0.0.1:8888',
  'hermes model set', 'hermes skills list',
  'hermes skills install', 'hermes skills update',
  'smithery mcp add', 'smithery mcp remove',
  'journalctl -u hermes -n 50 --no-pager',
])

function isAllowed(cmd: string): boolean {
  const trimmed = cmd.trim()
  if (WHITELIST.has(trimmed)) return true
  const parts = trimmed.split(/\s+/)
  const prefix = parts.slice(0, 3).join(' ')
  return WHITELIST.has(prefix)
}

// ─── Rate limit ────────────────────────────────────────────────────
const rateMap = new Map<string, number[]>()

function checkRate(userId: string): boolean {
  const now = Date.now()
  const times = (rateMap.get(userId) ?? []).filter(t => now - t < 60_000)
  if (times.length >= 30) return false
  times.push(now)
  rateMap.set(userId, times)
  return true
}

// ─── Logging ────────────────────────────────────────────────────────
async function logCmd(userId: string, cmd: string) {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    try {
      await sb.from('logs').insert({
        clerk_user_id: userId,
        message: cmd,
        level: 'ssh',
      })
    } catch { /* non-critical */ }
  } catch { /* non-critical */
  }
}

// ─── Get VPS credentials ───────────────────────────────────────────
async function getVPS(userId: string): Promise<{ vps_ip: string; vps_root_password: string }> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await sb
    .from('onboarding_submissions')
    .select('vps_ip, vps_root_password')
    .eq('clerk_user_id', userId)
    .eq('status', 'active')
    .single()
  if (error || !data || !data.vps_ip) {
    throw new Error('No active VPS for this user')
  }
  return { vps_ip: data.vps_ip, vps_root_password: data.vps_root_password ?? '' }
}

// ─── Core SSH exec ─────────────────────────────────────────────────
async function withSSH<T>(
  ip: string,
  password: string,
  fn: (ssh: NodeSSH) => Promise<T>
): Promise<T> {
  const ssh = new NodeSSH()
  await ssh.connect({ host: ip, port: 22, username: 'root', password })
  try {
    return await fn(ssh)
  } finally {
    ssh.dispose()
  }
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Execute a whitelisted command on the user's VPS.
 * Timeout: 30s (regular) or 120s (long-running commands).
 */
export async function execSSH(
  userId: string,
  command: string,
  timeoutMs = 30_000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  if (!isAllowed(command)) throw new Error('Command not whitelisted')
  if (!checkRate(userId)) throw new Error('Rate limit: 30 commands/minute')
  logCmd(userId, command)

  const { vps_ip, vps_root_password } = await getVPS(userId)
  return withSSH(vps_ip, vps_root_password, async (ssh) => {
    const result = await ssh.execCommand(command, {
      onStdout: () => {},
      onStderr: () => {},
      execTimeout: timeoutMs,
    } as any)
    return {
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
      exitCode: Number(result.code ?? 0),
    }
  })
}

/**
 * Stream output from a command on the user's VPS.
 * Chunks are forwarded to onChunk as they arrive.
 * Timeout: 30s (regular) or 120s (long-running).
 */
export async function streamSSH(
  userId: string,
  command: string,
  onChunk: (data: string) => void,
  timeoutMs = 30_000
): Promise<void> {
  if (!isAllowed(command)) throw new Error('Command not whitelisted')
  if (!checkRate(userId)) throw new Error('Rate limit: 30 commands/minute')
  logCmd(userId, command)

  const { vps_ip, vps_root_password } = await getVPS(userId)

  return withSSH(vps_ip, vps_root_password, (ssh) => {
    return new Promise<void>((resolve, reject) => {
      let settled = false
      const timer = setTimeout(() => {
        if (!settled) { settled = true; resolve() }
      }, timeoutMs)

      const connection = ssh.connection
      if (!connection) { settled = true; clearTimeout(timer); resolve(); return }

      try {
        connection.exec(command, (err, stream) => {
          if (err) { reject(err); return }
          stream.on('close', () => { if (!settled) { settled = true; clearTimeout(timer); resolve() } })
          stream.on('data', (chunk: Buffer) => { if (!settled) onChunk(chunk.toString()) })
          stream.stderr.on('data', (chunk: Buffer) => { if (!settled) onChunk('[ERR] ' + chunk.toString()) })
        })
      } catch (e) {
        if (!settled) { settled = true; clearTimeout(timer); resolve() }
      }
    })
  })
}
