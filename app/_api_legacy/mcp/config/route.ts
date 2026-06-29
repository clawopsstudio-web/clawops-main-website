import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MCP_CONFIG_PATH = path.join(process.cwd(), 'data', 'mcp-servers.json')

export async function GET() {
  try {
    let servers: Record<string, any> = {}

    if (fs.existsSync(MCP_CONFIG_PATH)) {
      servers = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, 'utf-8'))
    }

    return NextResponse.json({ servers })
  } catch {
    return NextResponse.json({ servers: {} })
  }
}
