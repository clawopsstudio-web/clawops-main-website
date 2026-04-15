import { NextResponse } from 'next/server'

const GATEWAY_URL = 'http://127.0.0.1:18789'
const TIMEOUT_MS = 5000

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'health'

    const url = `${GATEWAY_URL}/${endpoint}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gateway returned ${response.status}`, status: response.status },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError'
    console.error('[/api/openclaw-status] Error:', isAbort ? 'TIMEOUT' : err)
    return NextResponse.json(
      { error: isAbort ? 'Gateway timeout' : 'Gateway unreachable', details: err?.message },
      { status: isAbort ? 504 : 500 }
    )
  }
}
