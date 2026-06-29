import { NextRequest, NextResponse } from 'next/server'

const VPS_HOST = process.env.VPS_HOST || '178.238.232.52'
const SCREENSHOT_PORT = '5555'

export async function POST(req: NextRequest) {
  let url: string

  try {
    const body = await req.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  // Normalise URL
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  // Validate URL format
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  try {
    // Proxy to VPS screenshot service
    const response = await fetch(`http://${VPS_HOST}:${SCREENSHOT_PORT}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(35000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Screenshot failed: ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({
      ...data,
      url,
      capturedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[browser/screenshot] Error:', err)
    return NextResponse.json(
      { error: 'Screenshot service unavailable - please try again' },
      { status: 503 }
    )
  }
}
