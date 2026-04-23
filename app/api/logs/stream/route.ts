import { NextRequest } from 'next/server'
import { streamSSH } from '@/lib/vps-ssh'

export const runtime = 'nodejs'

/**
 * GET /api/logs/stream
 * SSE stream of Hermes logs
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const userId = req.headers.get('x-clerk-user-id') ?? ''

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      streamSSH(userId, 'tail -100 /root/.hermes/logs/hermes.log', (chunk) => {
        controller.enqueue(encoder.encode(chunk))
      }).catch(() => controller.close())
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
