import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SUPABASE_PROJECT = 'dyzkfmdjusdyjmytgeah'

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function validateJWT(token: string): { userId: string } | null {
  const payload = decodeJWT(token)
  if (!payload) return null
  if (payload.exp && Date.now() >= (payload.exp as number) * 1000) return null
  if (payload.ref !== SUPABASE_PROJECT) return null
  if (!payload.iss || !(payload.iss as string).includes('.supabase.co/auth/v1')) return null
  return { userId: payload.sub as string }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = validateJWT(accessToken)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId, message, history } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Try to communicate with OpenClaw Gateway
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const gatewayResponse = await fetch('http://127.0.0.1:18789/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.userId,
          'X-Agent-Id': agentId || 'orchestrator',
        },
        body: JSON.stringify({
          message,
          history: history || [],
          userId: user.userId,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (gatewayResponse.ok) {
        const data = await gatewayResponse.json()
        return NextResponse.json({ response: data.response || data.message })
      }
    } catch {
      // Gateway not available — fall through to fallback
    }

    // Fallback: Generate contextual response based on agent and message
    const response = generateFallbackResponse(agentId || 'orchestrator', message, history || [])
    return NextResponse.json({ response, source: 'fallback' })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function generateFallbackResponse(agentId: string, message: string, history: { role: string; content: string }[]): string {
  const lower = message.toLowerCase()
  const context = history.slice(-6)

  if (agentId === 'orchestrator' || agentId === 'henry') {
    if (lower.includes('help') || lower.includes('what can you do') || lower.includes('capabilities')) {
      return "I'm Henry, your AI co-founder at ClawOps. I specialize in:\n\n• **Strategic planning** — helping you build to $100k/month\n• **Product decisions** — what to build, what to defer\n• **Competitive analysis** — who's doing what, how to differentiate\n• **Workflow optimization** — automations that actually save time\n• **Team coordination** — I manage the other agents (Ryan, Arjun, Kyle) so you don't have to\n\nWhat's the biggest challenge you're facing right now?"
    }
    if (lower.includes('revenue') || lower.includes('money') || lower.includes('grow') || lower.includes('sales')) {
      return "Revenue growth for a ClawOps-style agency follows a clear path:\n\n1. **Land your first 3 clients** at $299/month (even if you have to discount) — referenceable clients beat revenue\n2. **Package the AI agent** as a distinct product with clear ROI metrics\n3. **Double the price** once you have 3 case studies\n4. **Add white-label** at $999/month for agencies who want to resell\n\nYour target of $100k/month = 25 clients at $4k ACV or 333 clients at $299/month. Which market are you going after first?"
    }
    if (lower.includes('competitor') || lower.includes('vs ') || lower.includes('alternative')) {
      return "For AI wrapper agencies, your main competitors are:\n\n• **Agency income team** — cheaper, less technical\n• **Make.com / Zapier + AI** — non-technical competitors\n• **Custom AI agents** (crewAI, LangGraph) — higher-end, more complex\n\nYour moat: **we own the infra** (OpenClaw on the VPS) which means your agents are faster, more reliable, and fully white-labeled. Competitors using SaaS AI tools can't do that."
    }
    if (lower.includes('roadmap') || lower.includes('feature') || lower.includes('build')) {
      return "Smart roadmap question. Here's what I'd prioritize:\n\n**Now (P0):**\n- Auth + dashboard working end-to-end ✅ (you're close)\n- Ops panel accessible to users ✅\n- GHL integration for agency clients\n\n**Next (P1):**\n- AI chat interface in dashboard\n- Team agent 1:1 chat\n- Channel integrations (Telegram, WhatsApp)\n\n**Later (P2):**\n- Multi-tenant: each client gets their own VPS\n- White-label dashboard for resellers\n- Usage-based pricing + analytics\n\nWhat phase are you in?"
    }
    return "Good point — let me think through this strategically. The key factors are your current positioning, what your competitors are doing, and how quickly you need to ship. Want me to break down the tradeoffs or do you already know which direction to take?"
  }

  if (agentId === 'dev' || agentId === 'ryan') {
    if (lower.includes('error') || lower.includes('bug') || lower.includes('not working') || lower.includes('crash')) {
      return "I'm Ryan, happy to help debug. To fix this efficiently:\n\n1. **Share the exact error message** — paste the full stack trace\n2. **Which file/line** is it happening on?\n3. **What did you change** since it last worked?\n\nYou can also check:\n- `pm2 logs` or `systemctl status <service>` on the VPS\n- Browser DevTools → Network tab for API errors\n- `/tmp/*.log` files on the server\n\nShare the details and I'll pinpoint the root cause."
    }
    if (lower.includes('supabase') || lower.includes('database') || lower.includes('auth')) {
      return "For Supabase auth, the key things to get right:\n\n1. **PKCE flow** — always use `flowType: 'pkce'` in your Supabase client config. The default 'implicit' flow is broken with Google OAuth.\n2. **Cookie setup** — set `sb-access-token` as a client-side cookie (not HttpOnly) so the ops panel can read it\n3. **redirectTo URL** — must be `https://app.clawops.studio/auth/callback` (exact)\n4. **Supabase allowed URLs** — add `https://app.clawops.studio` in your Supabase dashboard under Authentication → URL Configuration\n\nWhat specific Supabase issue are you hitting?"
    }
    if (lower.includes('next.js') || lower.includes('react') || lower.includes('component')) {
      return "For Next.js + React patterns we use:\n\n• **Server components** for data fetching (DB, auth)\n• **Client components** (`'use client'`) for interactivity\n• **Middleware** for auth guards and redirects\n• **`async/await` + `cookies()`** in server components (Next.js 15+)\n\nFor the dashboard, Kyle's already built the shell — the pattern is:\n```\napp/dashboard/[userId]/page.tsx  →  Server component (auth check)\ncomponents/dashboard/DashboardClient.tsx  →  Client component\n```\n\nWhat specifically are you building?"
    }
    return "I'm Ryan, senior developer at ClawOps. I handle full-stack development — Next.js, Node.js, databases, APIs, and system architecture. What are you working on? Share the problem and I'll give you an implementation plan."
  }

  if (agentId === 'arjun') {
    if (lower.includes('vps') || lower.includes('server') || lower.includes('ubuntu') || lower.includes('debian')) {
      return "For VPS management on Contabo, here's the essential stack:\n\n• **OpenClaw** — our AI agent framework (native, not Docker)\n• **nginx** — reverse proxy + SSL termination\n• **Cloudflared tunnel** — exposes services without opening ports\n• **systemd** — service management with auto-restart\n• **ufw** — firewall (only allow cloudflared + SSH)\n\n**Critical rules:**\n- NEVER expose ports 3456 (Next.js), 4001 (auth proxy), 7001 (ops) publicly\n- All traffic goes through cloudflared tunnel → nginx → internal ports\n- Use `journalctl -f -u <service>` to debug systemd services\n\nWhat's the specific VPS issue?"
    }
    if (lower.includes('security') || lower.includes('ssl') || lower.includes('tls') || lower.includes('https')) {
      return "Security essentials for the ClawOps VPS:\n\n**SSL/TLS:** Cloudflare handles this automatically if you're using their tunnel. No manual certbot needed.\n\n**Firewall (ufw):**\n```\nufw default deny incoming\nufw allow from 127.0.0.1 to any\nufw allow 22/tcp  # SSH (your IP only ideally)\nufw enable\n```\n\n**Service isolation:** Each service runs with minimal privileges. Don't run everything as root.\n\n**SSH keys:** Use key-based auth only. Disable password SSH.\n\n**Updates:** `apt update && apt upgrade -y` weekly via cron.\n\nWhich area do you want to harden?"
    }
    return "I'm Arjun, infrastructure and security lead. I manage the Contabo VPS, DevOps pipelines, monitoring, and security hardening. What infrastructure question do you have?"
  }

  if (agentId === 'support' || agentId === 'zeroclaw') {
    return "Hi! I'm ZeroClaw, your support agent. Here's how to get started:\n\n**Step 1:** Log in at https://app.clawops.studio with Google OAuth\n**Step 2:** Connect your integrations (GHL, Telegram, etc.) from the Integrations page\n**Step 3:** Chat with the AI team — Henry for strategy, Ryan for tech, Arjun for infra\n**Step 4:** Access your tools via the Ops Panel or directly from the dashboard sidebar\n\nWhat do you need help with? I can guide you through setup, troubleshoot issues, or answer questions about any feature."
  }

  return "I'm here and ready to help. What would you like to work on? You can ask me about building features, debugging issues, setting up integrations, or planning your product strategy."
}
