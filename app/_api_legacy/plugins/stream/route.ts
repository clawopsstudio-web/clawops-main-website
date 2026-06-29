import { NextRequest } from 'next/server'
import { streamSSH } from '@/lib/vps-ssh'

export const runtime = 'nodejs'

/**
 * GET /api/plugins/stream?cmd=<command>
 * Streams VPS command output via SSE
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cmd = searchParams.get('cmd') ?? ''
  const userId = req.headers.get('x-clerk-user-id') ?? ''

  if (!userId || !cmd) {
    return new Response('Missing parameters', { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamSSH(userId, cmd, (chunk) => {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
        })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (e: any) {
        controller.enqueue(encoder.encode(`data: ERROR: ${e.message}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
