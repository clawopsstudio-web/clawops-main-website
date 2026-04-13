import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SERVICE_MAP: Record<string, string> = {
  n8n: 'http://localhost:5678',
  chrome: 'http://localhost:5800',
  gateway: 'http://localhost:18789',
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

  const remainingPath = path.slice(2).join('/')
  const targetPath = `/${remainingPath}${req.nextUrl.search}`
  const targetUrl = `${targetBase}${targetPath}`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
    ? await req.arrayBuffer()
    : undefined

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        'X-User-Id': user.id,
        'X-User-Email': user.email || '',
      },
      body,
      redirect: 'manual',
    })

    const clone = response.clone()
    const isWebSocket = response.headers.get('upgrade') === 'websocket'

    if (isWebSocket) {
      return new Response(clone.body, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      })
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location && location.startsWith('/')) {
        const newLocation = `/${userId}/${serviceName}${location}`
        const newHeaders = new Headers(Object.fromEntries(response.headers.entries()))
        newHeaders.set('location', newLocation)
        return new Response(clone.body, { status: response.status, headers: newHeaders })
      }
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      let text = await clone.text()
      text = text
        .replace(/\/n8n\//g, `/${userId}/n8n/`)
        .replace(/"\/chrome\//g, `"/${userId}/chrome/`)
        .replace(/"\/gateway\//g, `"/${userId}/gateway/`)
      const newHeaders = new Headers(Object.fromEntries(response.headers.entries()))
      newHeaders.set('content-length', Buffer.byteLength(text).toString())
      return new Response(text, { status: response.status, headers: newHeaders })
    }

    return new Response(clone.body, {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (err) {
    console.error(`[proxy] Error proxying to ${targetUrl}:`, err)
    return NextResponse.json({ error: 'Proxy error', details: String(err) }, { status: 502 })
  }
}
