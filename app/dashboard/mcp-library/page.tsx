'use client'

import { useState, useEffect } from 'react'

interface MCPServer {
  name: string
  base_url: string
  tools: number
  status: 'healthy' | 'error' | 'unknown'
  last_checked?: string
}

interface MCPTool {
  name: string
  description: string
  inputSchema?: any
}

export default function MCPLibrary() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [tools, setTools] = useState<MCPTool[]>([])
  const [loading, setLoading] = useState(true)
  const [toolsLoading, setToolsLoading] = useState(false)
  const [addUrl, setAddUrl] = useState('')
  const [addName, setAddName] = useState('')
  const [addError, setAddError] = useState('')
  const [activeTab, setActiveTab] = useState<'servers' | 'add'>('servers')

  // Load servers from mcporter config
  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mcp/servers')
      if (res.ok) {
        const data = await res.json()
        setServers(data.servers || [])
      } else {
        // Fallback: load from local config
        const configRes = await fetch('/api/mcp/config')
        if (configRes.ok) {
          const config = await configRes.json()
          const serversList: MCPServer[] = Object.entries(config.servers || {}).map(([name, srv]: [string, any]) => ({
            name,
            base_url: (srv as any).baseUrl || '',
            tools: 0,
            status: 'unknown',
          }))
          setServers(serversList)
        }
      }
    } catch {
      // graceful degradation
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  const loadTools = async (server: MCPServer) => {
    setSelectedServer(server)
    setToolsLoading(true)
    setTools([])
    try {
      const res = await fetch(`/api/mcp/servers/${server.name}/tools`)
      if (res.ok) {
        const data = await res.json()
        setTools(data.tools || [])
      }
    } catch {
      setTools([])
    } finally {
      setToolsLoading(false)
    }
  }

  const handleAddServer = async () => {
    setAddError('')
    if (!addName.trim() || !addUrl.trim()) {
      setAddError('Name and URL are required')
      return
    }
    try {
      const res = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName.trim(), base_url: addUrl.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setAddError(data.error || 'Failed to add server')
        return
      }
      setAddName('')
      setAddUrl('')
      setActiveTab('servers')
      loadServers()
    } catch {
      setAddError('Failed to add server')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">MCP Library</h1>
        <p className="text-gray-400 text-sm">
          Model Context Protocol servers — connect AI agents to external tools and APIs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1a2e] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('servers')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'servers' ? 'bg-[#e8ff47] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Servers ({servers.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'add' ? 'bg-[#e8ff47] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          + Add Server
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Add MCP Server</h2>
          <p className="text-gray-400 text-sm mb-6">
            Add any MCP server by providing its URL. The server will be registered with mcporter and made available to your AI agents.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Server Name</label>
              <input
                type="text"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="e.g. notion, github, slack"
                className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-[#e8ff47] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">MCP Server URL</label>
              <input
                type="url"
                value={addUrl}
                onChange={e => setAddUrl(e.target.value)}
                placeholder="https://your-server.com/mcp or /n8n/mcp/{id}"
                className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-[#e8ff47] focus:outline-none"
              />
            </div>
            {addError && <p className="text-red-400 text-sm">❌ {addError}</p>}
            <button
              onClick={handleAddServer}
              className="w-full bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-semibold py-2.5 rounded-lg transition-colors"
            >
              Add Server
            </button>
          </div>

          <div className="mt-6 bg-[#0f0f1a] rounded-lg p-3">
            <p className="text-xs text-gray-400">
              💡 Your OpenClaw VPS must be able to reach the MCP server URL. For internal services, use the Tailscale domain (e.g. <code className="text-emerald-400">https://app.clawops.studio/n8n/mcp/...</code>)
            </p>
          </div>
        </div>
      )}

      {activeTab === 'servers' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2].map(i => (
                <div key={i} className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl h-40 animate-pulse" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔌</span>
              <p className="text-gray-400 mb-2">No MCP servers configured.</p>
              <p className="text-gray-600 text-sm mb-6">Add an MCP server to connect your AI agents to external tools.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-[#e8ff47] text-black font-medium px-6 py-2.5 rounded-lg hover:bg-[#d4eb3a] transition-colors"
              >
                + Add Your First Server
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map(server => (
                <div
                  key={server.name}
                  className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 hover:border-[#e8ff47]/50 transition-colors cursor-pointer"
                  onClick={() => loadTools(server)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔌</span>
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          server.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                          server.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {server.status === 'healthy' ? '● Healthy' :
                           server.status === 'error' ? '✕ Error' : '○ Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 break-all">{server.base_url}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {server.tools > 0 ? `${server.tools} tools` : 'Click to load tools'}
                    </span>
                    <span className="text-[#e8ff47] text-sm">View →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tool detail sidebar */}
      {selectedServer && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedServer(null)}>
          <div
            className="w-full max-w-xl bg-[#1a1a2e] border-l border-[#2d2d44] h-full overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#1a1a2e] border-b border-[#2d2d44] p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedServer.name}</h2>
                <p className="text-xs text-gray-500 break-all">{selectedServer.base_url}</p>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-gray-400 hover:text-white text-2xl ml-4"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                {toolsLoading ? 'Loading tools...' : `${tools.length} Tools`}
              </h3>

              {toolsLoading && (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="bg-[#0f0f1a] rounded-lg h-20 animate-pulse" />
                  ))}
                </div>
              )}

              {!toolsLoading && tools.length === 0 && (
                <p className="text-gray-500 text-sm">No tools found or server unavailable.</p>
              )}

              {!toolsLoading && tools.map(tool => (
                <div key={tool.name} className="bg-[#0f0f1a] rounded-lg p-4 mb-3 border border-[#2d2d44]">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">⚙️</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-white break-all">{tool.name}</h4>
                      {tool.description && (
                        <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                      )}
                      {tool.inputSchema?.properties && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.keys(tool.inputSchema.properties).map(param => (
                            <span key={param} className="text-[10px] bg-[#1a1a2e] text-[#e8ff47] px-1.5 py-0.5 rounded">
                              {param}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 bg-[#1a1a2e] rounded-xl p-6 border border-[#2d2d44]">
        <h2 className="text-lg font-semibold mb-4">What Are MCP Servers?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">🔌 Model Context Protocol</h3>
            <p className="text-gray-400 text-sm">
              MCP is a standard protocol for connecting AI agents to external tools. Add any MCP-compatible server to extend your AI's capabilities.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">🌐 mcporter</h3>
            <p className="text-gray-400 text-sm">
              ClawOps uses mcporter to manage MCP servers. Servers are registered in the mcporter config and automatically available to all AI agents.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">⚡ Built-in servers</h3>
            <p className="text-gray-400 text-sm">
              Your Google Workspace (n8n MCP), Notion, and other integrations are already configured as MCP servers. Browse the Skills Library to install more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
