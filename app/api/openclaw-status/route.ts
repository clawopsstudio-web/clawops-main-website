import { NextResponse } from 'next/server'

const VPS_API = 'https://app.clawops.studio'
const TIMEOUT_MS = 5000

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || ''

    const url = endpoint
      ? `${VPS_API}/${endpoint}`
      : VPS_API

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 10 },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: `VPS returned ${response.status}`, status: response.status },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError'
    console.error('[/api/openclaw-status] Error:', isAbort ? 'TIMEOUT' : err)
    return NextResponse.json(
      { error: isAbort ? 'VPS timeout' : 'Internal server error' },
      { status: isAbort ? 504 : 500 }
    )
  }
}
