import { NextRequest, NextResponse } from 'next/server'

const SERVICE_MAP: Record<string, string> = {
  n8n:     'http://localhost:5678',
  chrome:  'http://localhost:5800',
  gateway: 'http://localhost:18789',
}

// Decode userId from the sb-access-token JWT (base64url JSON payload).
// The token is already validated by middleware, so we just extract the sub claim.
function getUserIdFromToken(token: string): string | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice((base64.length + 4) % 4 === 0 ? 0 : (base64.length + 4) % 4)
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
    return payload.sub || null
  } catch {
    return null
  }
}

// Rewrite Location header to point back to the proxy URL.
// Handles: absolute URLs like http://localhost:5678/foo → /{userId}/n8n/foo
// Handles: relative URLs like /foo → /{userId}/n8n/foo
function rewriteLocation(location: string, serviceName: string, userId: string): string {
  const base = SERVICE_MAP[serviceName]
  if (!base) return location

  // Absolute URL to the backend service
  if (location.startsWith(base)) {
    return `/${userId}/${serviceName}${location.slice(base.length)}`
  }
  // Relative path
  if (location.startsWith('/')) {
    return `/${userId}/${serviceName}${location}`
  }
  return location
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  const userId = path[0]
  const serviceName = path[1]

  const targetBase = SERVICE_MAP[serviceName]
  if (!targetBase) {
    return NextResponse.json({ error: 'Unknown service' }, { status: 404 })
  }

  // ── Auth: use cookies already validated by middleware ──────────────────────
  const accessToken = req.cookies.get('sb-access-token')?.value
  const cookieUserId = req.cookies.get('sb-user-id')?.value

  if (!accessToken || !cookieUserId) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Decode userId from JWT and verify it matches the URL
  const tokenUserId = getUserIdFromToken(accessToken)
  if (!tokenUserId || tokenUserId !== userId || userId !== cookieUserId) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const remainingPath = path.slice(2).join('/')
  const targetPath = `/${remainingPath}${req.nextUrl.search}`
  const targetUrl = `${targetBase}${targetPath}`

  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ? await req.arrayBuffer()
    : undefined

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        'X-User-Id': userId,
        'X-User-Email': req.cookies.get('sb-user-email')?.value || '',
      },
      body,
      redirect: 'manual',
    })

    // ── WebSocket pass-through ──────────────────────────────────────────────
    if (response.headers.get('upgrade') === 'websocket') {
      return new Response(response.body, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      })
    }

    // ── Build response, rewriting Location headers ─────────────────────────
    const newHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'location') {
        newHeaders.set(key, rewriteLocation(value, serviceName, userId))
      } else {
        newHeaders.set(key, value)
      }
    })

    // ── Redirects ──────────────────────────────────────────────────────────
    if (response.status >= 300 && response.status < 400) {
      return new Response(response.body, { status: response.status, headers: newHeaders })
    }

    // ── HTML: rewrite internal links to use the proxy URL ──────────────────
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      let text = await response.text()
      text = text
        .replace(/\/n8n\//g, `/${userId}/n8n/`)
        .replace(/"\/chrome\//g, `"/${userId}/chrome/`)
        .replace(/"\/gateway\//g, `"/${userId}/gateway/`)
      newHeaders.set('content-length', Buffer.byteLength(text).toString())
      return new Response(text, { status: response.status, headers: newHeaders })
    }

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  } catch (err) {
    console.error(`[proxy] Error proxying to ${targetUrl}:`, err)
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 502 })
  }
}
