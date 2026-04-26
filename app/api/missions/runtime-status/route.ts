/**
 * app/api/missions/runtime-status/route.ts
 * GET /api/missions/runtime-status
 *
 * Returns real Hermes runtime status by querying the test VPS via SSH.
 * Never exposes SSH credentials — all VPS commands run server-side.
 *
 * Returns:
 * {
 *   hermes: { running, activeState, pid, uptime },
 *   vps: { cpu, ram, disk },
 *   agents: [],
 *   lastSync: ISO timestamp,
 *   error?: string
 * }
 */
import { NextResponse } from 'next/server'
import {
  execSSHCommand,
  parseHermesStatus,
  parseDisk,
  parseMemory,
} from '@/lib/vps-ssh-test'

export const runtime = 'nodejs'

export async function GET() {
  const now = new Date().toISOString()

  try {
    // Run all status commands in parallel
    const [statusResult, diskResult, memResult] = await Promise.allSettled([
      execSSHCommand('systemctl status hermes-web.service --no-pager'),
      execSSHCommand('df -h'),
      execSSHCommand('free -h'),
    ])

    // Parse hermes status
    let hermes = {
      running: false,
      activeState: 'unknown',
      subState: '',
      pid: null as string | null,
      uptime: null as string | null,
      rawOutput: '',
    }
    if (statusResult.status === 'fulfilled') {
      hermes = {
        ...parseHermesStatus(statusResult.value.stdout),
        rawOutput: statusResult.value.stdout.slice(0, 500),
      }
    }

    // Parse disk usage
    let disk = { used: '-', available: '-', percent: 0 }
    if (diskResult.status === 'fulfilled') {
      disk = parseDisk(diskResult.value.stdout)
    }

    // Parse RAM
    let ram = { total: '-', used: '-', free: '-', percent: 0 }
    if (memResult.status === 'fulfilled') {
      ram = parseMemory(memResult.value.stdout)
    }

    // Get CPU load
    let cpu = { load: '-', uptime: '-' }
    try {
      const [loadResult, uptimeResult] = await Promise.allSettled([
        execSSHCommand('cat /proc/loadavg'),
        execSSHCommand('uptime'),
      ])
      if (loadResult.status === 'fulfilled') {
        cpu.load = loadResult.value.stdout.trim()
      }
      if (uptimeResult.status === 'fulfilled') {
        cpu.uptime = uptimeResult.value.stdout.trim()
      }
    } catch { /* non-critical */ }

    return NextResponse.json({
      hermes,
      vps: {
        cpu,
        ram,
        disk,
      },
      agents: [], // TODO: wire up agent runtime from Hermes gateway
      lastSync: now,
    })
  } catch (err: any) {
    console.error('[/api/missions/runtime-status]', err)
    return NextResponse.json({
      hermes: { running: false, activeState: 'error', subState: '', pid: null, uptime: null, rawOutput: '' },
      vps: { cpu: { load: '-', uptime: '-' }, ram: { total: '-', used: '-', free: '-', percent: 0 }, disk: { used: '-', available: '-', percent: 0 } },
      agents: [],
      lastSync: now,
      error: err.message ?? 'Failed to reach test VPS',
    }, { status: 200 })
  }
}
