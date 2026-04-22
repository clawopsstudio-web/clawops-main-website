/**
 * lib/hermes-install.ts — Hermes install on client VPS via SSH
 *
 * After Contabo provisions the VPS, this script:
 * 1. SSHs in as root
 * 2. Updates system + installs system packages
 * 3. Installs Docker + Ollama
 * 4. Installs and configures SearXNG (self-hosted web search)
 * 5. Installs Python tools (firecrawl-py, duckduckgo-search)
 * 6. Installs Hermes-Agent v0.10.0
 * 7. Configures Hermes with NVIDIA API (OpenAI-compatible)
 * 8. Health checks
 * 9. Returns dashboard URL
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
  dashboardUrl?: string
  error?: string
}

// Full provisioning script injected onto the VPS
const PROVISION_SCRIPT = `
set -e

NVIDIA_API_KEY="{{NVIDIA_API_KEY}}"

log() { echo "[$(date)] $1"; }

log "=== ClawOps VPS Setup ==="

# Step 1: System packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq 2>/dev/null | tail -2
apt-get install -y -qq python3-full python3-pip python3-venv git curl wget jq htop tree ncdu httpie python3-babel python3-lxml sshpass 2>&1 | tail -3

# Step 2: Docker (Contabo images usually have it, ensure running)
systemctl enable docker 2>/dev/null || true
systemctl start docker 2>/dev/null || true
docker --version

# Step 3: Ollama
if ! command -v ollama &>/dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi
systemctl enable ollama 2>/dev/null || true
systemctl start ollama 2>/dev/null || true

# Step 4: SearXNG
if [ ! -f /opt/searxng/local/py3/bin/searxng-run ]; then
  git clone --depth=1 https://github.com/searxng/searxng /opt/searxng
  cd /opt/searxng
  make -f Makefile install 2>&1 | tail -3
fi

SECRET=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
mkdir -p /etc/searxng
cat > /etc/searxng/settings.yml << 'SXEOF'
use_default_settings: true
general:
  instance_name: ClawOps Search
search:
  safe_search: 0
  default_lang: en
server:
  bind_address: 127.0.0.1
  port: 8888
  limiter: false
outgoing:
  request_timeout: 10.0
ui:
  static_use_hash: true
  default_theme: simple
SXEOF

python3 -c "
import yaml, secrets
cfg = yaml.safe_load(open('/etc/searxng/settings.yml'))
cfg.setdefault('server', {})['secret_key'] = secrets.token_hex(32)
yaml.dump(cfg, open('/etc/searxng/settings.yml','w'))
"

cat > /etc/systemd/system/searxng.service << 'SVCEOF'
[Unit]
Description=SearXNG Meta Search Engine
After=network.target
[Service]
Type=simple
User=root
Environment="SEARXNG_SETTINGS_PATH=/etc/searxng/settings.yml"
ExecStart=/opt/searxng/local/py3/bin/searxng-run
Restart=on-failure
RestartSec=5s
[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable searxng
systemctl start searxng
sleep 2
curl -s http://127.0.0.1:8888 | grep -c 'html' && log "SearXNG UP"

# Step 5: Python tools
pip3 install firecrawl-py duckduckgo-search --break-system-packages --ignore-installed typing-extensions -q 2>&1 | tail -2
python3 -c 'import firecrawl; print("Firecrawl OK")'
python3 -c 'from duckduckgo_search import DDGS; print("DDG OK")'

# Step 6: Hermes-Agent
if [ ! -f /root/.hermes/hermes-agent/hermes ]; then
  curl -Ls https://github.com/NousResearch/Hermes-Agent/releases/download/v0.10.0/hermes-installer.sh | bash 2>&1 | tail -5
fi

# Step 7: Hermes config with NVIDIA API
cat > /root/.hermes/config.yaml << 'HEOF'
model:
  provider: custom
  base_url: https://integrate.api.nvidia.com/v1
  api_key: ${NVIDIA_API_KEY}
  default: moonshotai/kimi-k2-thinking
  context_length: 131072
  max_tokens: 16384
agent:
  reasoning_effort: none
compression:
  enabled: false
auxiliary:
  compression:
    enabled: false
    model: moonshotai/kimi-k2-thinking
    context_length: 131072
websearch:
  provider: searxng
  base_url: http://127.0.0.1:8888
tools:
  enabled:
    - terminal
    - file
    - web
    - browser
    - code_execution
    - vision
    - image_gen
    - tts
    - skills
    - todo
    - memory
    - session_search
    - clarify
    - delegation
    - cronjob
    - messaging
HEOF

# Symlink hermes binary
if [ ! -L /usr/local/bin/hermes ]; then
  ln -sf /root/.hermes/hermes-agent/hermes /usr/local/bin/hermes
fi

log "=== VPS Setup Complete ==="
`

async function sshExec(
  ssh: NodeSSH,
  command: string,
  label: string,
  timeout = 300_000
): Promise<string> {
  console.log(`[hermes-install] ${label}...`)
  const result = await ssh.execCommand(command, {
    cwd: '/root',
    timeout,
    env: { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' },
  })
  if (result.code !== 0) {
    throw new Error(`${label} failed (code ${result.code}): ${result.stderr?.slice(-500)}`)
  }
  return result.stdout
}

export async function installHermesOnVPS(params: {
  ipAddress: string
  sshPassword: string
  instanceId: string
  config: HermesConfig
  nvidiaApiKey?: string   // from env var, defaults to ClawOps key
}): Promise<InstallResult> {
  const { ipAddress, sshPassword, instanceId, config, nvidiaApiKey } = params
  const logs: string[] = []
  const ssh = new NodeSSH()

  const NVIDIA_API_KEY = nvidiaApiKey || process.env.NVIDIA_API_KEY || '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'
  const script = PROVISION_SCRIPT.replace('{{NVIDIA_API_KEY}}', NVIDIA_API_KEY)

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

    // ── 2. Write and run provision script ───────────────────────────────
    // Write script to remote server
    const scriptB64 = Buffer.from(script).toString('base64')
    await sshExec(
      ssh,
      `echo "${scriptB64}" | base64 -d > /tmp/clawops_setup.sh && chmod +x /tmp/clawops_setup.sh`,
      'Script transfer'
    )
    logs.push('Script transferred')

    // Run it (this takes 5-15 minutes)
    const output = await sshExec(ssh, 'bash /tmp/clawops_setup.sh 2>&1', 'Full VPS setup', 900_000)
    logs.push('Setup output: ' + output.slice(-500))

    // ── 3. Smoke test ───────────────────────────────────────────────────
    logs.push('Running smoke tests...')

    // Test SearXNG
    const searxngTest = await ssh.execCommand(
      'curl -s http://127.0.0.1:8888/search?q=hello | grep -c "hello"',
      { timeout: 10_000 }
    )
    logs.push(`SearXNG: ${searxngTest.stdout.trim() > '0' ? 'OK' : 'FAILED'}`)

    // Test Hermes
    const hermesTest = await ssh.execCommand(
      'timeout 30 hermes chat -q "say ok" -t terminal,file 2>&1 | grep -c "ok"',
      { timeout: 45_000 }
    )
    logs.push(`Hermes: ${hermesTest.stdout.trim() > '0' ? 'OK' : 'FAILED'}`)

    const dashboardUrl = `https://${config.entity_id}.app.clawops.studio`
    await ssh.dispose()

    return {
      success: true,
      instanceId,
      logs,
      dashboardUrl,
    }
  } catch (err: any) {
    await ssh.dispose()
    return { success: false, instanceId, logs, error: err.message }
  }
}
