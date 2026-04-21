// Proxy API route for iframing service pages inside the dashboard
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const SERVICE_PORTS: Record<string, number> = {
  n8n: 5678,
  chrome: 5800,
  gateway: 18789,
}

async function proxyRequest(request: NextRequest, service: string, method: string) {
  const port = SERVICE_PORTS[service]
  if (!port) {
    return new NextResponse('Service not found', { status: 404 })
  }

  const { userId, getToken } = await auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const clerkToken = await getToken()
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const upstreamRes = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        'X-Forwarded-User-Id': userId,
        'X-Clerk-Token': clerkToken || '',
        'X-Forwarded-Proto': 'https',
        'Host': 'app.clawops.studio',
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body: method !== 'GET' ? await request.arrayBuffer() : undefined,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const headers = new Headers()
    upstreamRes.headers.forEach((value, key) => {
      if (!['content-security-policy', 'x-frame-options', 'x-xss-protection'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })
    headers.set('Access-Control-Allow-Origin', 'https://app.clawops.studio')
    headers.set('Access-Control-Allow-Credentials', 'true')

    const body = await upstreamRes.arrayBuffer()
    return new NextResponse(body, { status: upstreamRes.status, headers })

  } catch (e) {
    return new NextResponse('Service unavailable: ' + String(e), { status: 502 })
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ service: string }> }
) {
  const { service } = await context.params
  return proxyRequest(request, service, 'GET')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ service: string }> }
) {
  const { service } = await context.params
  return proxyRequest(request, service, 'POST')
}
