// Proxy API route for iframing service pages inside the dashboard
// Reads sb-access-token cookie server-side, validates JWT, proxies to target service
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SERVICE_PORTS: Record<string, number> = {
  n8n: 5678,
  chrome: 5800,
  gateway: 18789,
}

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ service: string }> }
) {
  const { service } = await context.params
  const port = SERVICE_PORTS[service]

  if (!port) {
    return new NextResponse('Service not found', { status: 404 })
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const user = validateJWT(accessToken)
  if (!user) {
    return new NextResponse('Invalid session', { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'

  try {
    const controller1 = new AbortController();
    const t1 = setTimeout(() => controller1.abort(), 10000);
    const upstreamRes = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'GET',
      headers: {
        'Cookie': `sb-access-token=${accessToken}`,
        'X-Forwarded-User-Id': user.userId,
        'X-Forwarded-Proto': 'https',
        'Host': 'app.clawops.studio',
      },
      signal: controller1.signal,
    });
    clearTimeout(t1);

    const headers = new Headers()
    upstreamRes.headers.forEach((value, key) => {
      // Filter out headers that cause issues with iframe embedding
      if (!['content-security-policy', 'x-frame-options', 'x-xss-protection'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })
    headers.set('Access-Control-Allow-Origin', 'https://app.clawops.studio')
    headers.set('Access-Control-Allow-Credentials', 'true')

    const body = await upstreamRes.arrayBuffer()
    return new NextResponse(body, {
      status: upstreamRes.status,
      headers,
    })
  } catch (e) {
    return new NextResponse('Service unavailable: ' + String(e), { status: 502 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ service: string }> }
) {
  const { service } = await context.params
  const port = SERVICE_PORTS[service]

  if (!port) {
    return new NextResponse('Service not found', { status: 404 })
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const user = validateJWT(accessToken)
  if (!user) {
    return new NextResponse('Invalid session', { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  const body = await request.arrayBuffer()

  try {
    const controller2 = new AbortController();
    const t2 = setTimeout(() => controller2.abort(), 10000);
    const upstreamRes = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: {
        'Cookie': `sb-access-token=${accessToken}`,
        'X-Forwarded-User-Id': user.userId,
        'X-Forwarded-Proto': 'https',
        'Host': 'app.clawops.studio',
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body,
      signal: controller2.signal,
    });
    clearTimeout(t2);

    const headers = new Headers()
    upstreamRes.headers.forEach((value, key) => {
      if (!['content-security-policy', 'x-frame-options', 'x-xss-protection'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })

    const resBody = await upstreamRes.arrayBuffer()
    return new NextResponse(resBody, {
      status: upstreamRes.status,
      headers,
    })
  } catch (e) {
    return new NextResponse('Service unavailable: ' + String(e), { status: 502 })
  }
}
