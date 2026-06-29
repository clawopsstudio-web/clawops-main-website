import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MCP_CONFIG_PATH = path.join(process.cwd(), 'data', 'mcp-servers.json')

// GET: List MCP servers
export async function GET() {
  try {
    let servers: Record<string, any> = {}

    // Try reading from local config file
    if (fs.existsSync(MCP_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, 'utf-8'))
      servers = data.servers || {}
    }

    // Add the known n8n-google server
    const knownServers = {
      'n8n-google': {
        name: 'n8n-google',
        base_url: 'https://app.clawops.studio/n8n/mcp/89a55f12-1823-4f0d-9568-980732c57a89',
        tools: 44,
        status: 'healthy',
        description: 'Google Workspace via n8n MCP — Gmail, Drive, Docs, Sheets, Calendar, Tasks',
        platforms: ['Google', 'Gmail', 'Drive', 'Docs', 'n8n'],
      },
    }

    const allServers = { ...knownServers, ...servers }

    return NextResponse.json({
      servers: Object.entries(allServers).map(([name, data]: [string, any]) => ({
        name,
        base_url: data.base_url || data.url || '',
        tools: data.tools || 0,
        status: data.status || 'unknown',
        description: data.description || '',
        platforms: data.platforms || [],
      })),
    })
  } catch (err) {
    return NextResponse.json({ servers: [], error: 'Failed to load servers' }, { status: 500 })
  }
}

// POST: Add a new MCP server
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, base_url } = body

    if (!name || !base_url) {
      return NextResponse.json({ error: 'name and base_url are required' }, { status: 400 })
    }

    // Sanitize name (lowercase, no spaces)
    const safeName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-')

    // Load existing config
    let config = { servers: {} as Record<string, any> }
    if (fs.existsSync(MCP_CONFIG_PATH)) {
      config = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, 'utf-8'))
    }

    // Add new server
    config.servers[safeName] = {
      baseUrl: base_url,
      added_at: new Date().toISOString(),
      status: 'unknown',
      tools: 0,
    }

    // Ensure data directory exists
    const dir = path.dirname(MCP_CONFIG_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2))

    return NextResponse.json({
      success: true,
      server: { name: safeName, base_url },
      note: 'Server added to local config. For it to be active, update mcporter.json on your VPS with this server.',
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add server' }, { status: 500 })
  }
}
