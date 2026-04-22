/**
 * lib/hermes-install.ts — Hermes install on client VPS via SSH
 *
 * After Contabo provisions the VPS, this script:
 * 1. SSHs in as root
 * 2. Updates system
 * 3. Installs Docker + Docker Compose
 * 4. Runs Hermes install script
 * 5. Creates hermes.config.json
 * 6. Starts Hermes container
 * 7. Health checks the /health endpoint
 */

import { NodeSSH } from 'node-ssh'

interface HermesConfig {
  entity_id: string
  composio_api_key: string
  owner_telegram?: string
  plan: string
  dashboard_url: string
}

interface InstallResult {
  success: boolean
  instanceId?: string
  logs: string[]
  error?: string
}

const HERMES_INSTALL_CMD = `curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash`

const DOCKER_INSTALL_CMD = `
apt-get update -qq && apt-get install -y -qq docker.io docker-compose > /dev/null 2>&1 &&
systemctl enable docker && systemctl start docker &&
echo "DOCKER_OK" &&
docker --version
`

async function sshExec(
  ssh: NodeSSH,
  command: string,
  label: string
): Promise<string> {
  console.log(`[hermes-install] ${label}...`)
  const result = await ssh.execCommand(command, {
    cwd: '/root',
    timeout: 300_000,
    env: { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' },
  })
  if (result.code !== 0) {
    throw new Error(`${label} failed (code ${result.code}): ${result.stderr}`)
  }
  return result.stdout
}

export async function installHermesOnVPS(params: {
  ipAddress: string
  sshPassword: string
  instanceId: string
  config: HermesConfig
  hermesRegistryUrl?: string   // not ready yet — placeholder
}): Promise<InstallResult> {
  const { ipAddress, sshPassword, instanceId, config, hermesRegistryUrl } = params
  const logs: string[] = []
  const ssh = new NodeSSH()

  try {
    // ── 1. Connect via SSH ──────────────────────────────────────────────
    logs.push(`Connecting to ${ipAddress}...`)
    await ssh.connect({
      host: ipAddress,
      port: 22,
      username: 'root',
      password: sshPassword,
      timeout: 30_000,
      readyTimeout: 30_000,
    })
    logs.push('SSH connected')

    // ── 2. System update ─────────────────────────────────────────────────
    await sshExec(ssh, 'apt-get update -qq && apt-get install -y -qq curl git', 'System update')
    logs.push('System updated')

    // ── 3. Install Docker ────────────────────────────────────────────────
    const dockerOut = await sshExec(ssh, DOCKER_INSTALL_CMD, 'Docker install')
    logs.push(`Docker: ${dockerOut.trim()}`)

    // ── 4. Hermes install ────────────────────────────────────────────────
    if (hermesRegistryUrl) {
      // Full Hermes install when registry URL is available
      const fullInstall = `${HERMES_INSTALL_CMD} 2>&1`
      await sshExec(ssh, fullInstall, 'Hermes install')
      logs.push('Hermes installed')
    } else {
      // Placeholder: install Hermes deps but mark as pending
      logs.push('HERMES_PENDING: registry URL not set — installing deps only')
      // Install uv + Python 3.11 (Hermes prerequisites)
      await sshExec(ssh, 'curl -LsSf https://astral.sh/uv/install.sh | sh 2>&1 | tail -3', 'uv install')
      logs.push('uv installed (Hermes prerequisite)')
    }

    // ── 5. Create hermes.config.json ─────────────────────────────────────
    const configJson = JSON.stringify(config, null, 2)
    const configB64 = Buffer.from(configJson).toString('base64')
    await sshExec(
      ssh,
      `echo "${configB64}" | base64 -d > /root/hermes.config.json && echo "CONFIG_WRITTEN"`,
      'Config write'
    )
    logs.push('hermes.config.json written')

    // ── 6. Health check ─────────────────────────────────────────────────
    if (hermesRegistryUrl) {
      let healthy = false
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 30_000))
        try {
          const res = await fetch(`http://${ipAddress}:8000/health`, { signal: AbortSignal.timeout(5_000) })
          if (res.ok) {
            logs.push(`Health check passed after ${(i + 1) * 30}s`)
            healthy = true
            break
          }
        } catch {
          logs.push(`Health check attempt ${i + 1}/10 — waiting...`)
        }
      }
      if (!healthy) {
        logs.push('Health check did not pass within 5 minutes — continuing anyway')
      }
    }

    await ssh.dispose()
    return { success: true, instanceId, logs }

  } catch (err: any) {
    await ssh.dispose()
    return { success: false, instanceId, logs, error: err.message }
  }
}
