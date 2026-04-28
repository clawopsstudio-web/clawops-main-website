'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface VPS {
  id: string
  tunnel_url: string
  status: string
}

interface Agent {
  id: string
  hermes_agent_id: string
  agent_name: string
  agent_role: string | null
}

interface Message {
  id: string
  role: 'user' | 'agent'
  agent_name?: string
  content: string
  timestamp: string
}

const AGENT_COLORS: Record<string, string> = {
  Ryan: '#22c55e', Arjun: '#f59e0b', Helena: '#3b82f6',
  Sarah: '#ec4899', Mike: '#8b5cf6', Tyler: '#f97316',
  default: '#6b7280',
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const agentParam = searchParams.get('agent')
  
  const [vps, setVps] = useState<VPS | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingVps, setLoadingVps] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load VPS and agents
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('Not logged in')
          setLoadingVps(false)
          return
        }

        // Fetch user's VPS
        const { data: vpsData } = await supabase
          .from('vps_instances')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vpsData) {
          setVps(vpsData)
        }

        // Fetch agents
        const { data: agentsData } = await supabase
          .from('vps_agents')
          .select('*')
          .eq('user_id', user.id)

        if (agentsData && agentsData.length > 0) {
          setAgents(agentsData)
          // Auto-select agent if param provided
          if (agentParam) {
            const agent = agentsData.find((a: any) => a.id === agentParam)
            if (agent) setSelectedAgent(agent)
          } else {
            setSelectedAgent(agentsData[0])
          }
        }

      } catch (err: any) {
        console.error('[chat] Error:', err)
        setError(err.message)
      } finally {
        setLoadingVps(false)
      }
    }

    loadData()
  }, [agentParam])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedAgent || !vps) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }])

    try {
      // Call Hermes API on user's VPS
      const hermesUrl = `${vps.tunnel_url}/chat`
      
      const response = await fetch(hermesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          agent: selectedAgent.hermes_agent_id,
          session_id: `session-${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Hermes error: ${response.status}`)
      }

      const data = await response.json()

      // Add agent response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agent_name: selectedAgent.agent_name,
        content: data.response || data.message || 'Agent is thinking...',
        timestamp: new Date().toISOString(),
      }])

    } catch (err: any) {
      console.error('[chat] Send error:', err)
      
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agent_name: selectedAgent.agent_name,
        content: `Error: ${err.message}. Make sure your VPS is online.`,
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, selectedAgent, vps])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getAgentColor = (name: string) => AGENT_COLORS[name] || AGENT_COLORS.default

  if (loadingVps) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Connecting to your agents...</div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red-400 text-sm">Error: {error}</div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-44px)] bg-[#0a0a0a]">
      {/* Agent Sidebar */}
      <div className="w-64 bg-[#111] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white font-bold text-sm">Agents</h2>
          <p className="text-white/30 text-xs mt-1">
            {vps ? vps.tunnel_url : 'No VPS connected'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">No agents available</p>
            </div>
          ) : (
            agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ 
                      backgroundColor: getAgentColor(agent.agent_name) + '20',
                      color: getAgentColor(agent.agent_name),
                    }}
                  >
                    {agent.agent_name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{agent.agent_name}</p>
                    <p className="text-white/30 text-xs">{agent.agent_role || 'Agent'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedAgent ? (
              <>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ 
                    backgroundColor: getAgentColor(selectedAgent.agent_name) + '20',
                    color: getAgentColor(selectedAgent.agent_name),
                  }}
                >
                  {selectedAgent.agent_name[0]}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{selectedAgent.agent_name}</p>
                  <p className="text-white/30 text-xs">{selectedAgent.agent_role || 'AI Agent'}</p>
                </div>
              </>
            ) : (
              <p className="text-white/40 text-sm">Select an agent to chat</p>
            )}
          </div>
          {vps && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <div className={`w-1.5 h-1.5 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {vps.status === 'online' ? 'Connected' : 'Disconnected'}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && selectedAgent && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ 
                  backgroundColor: getAgentColor(selectedAgent.agent_name) + '20',
                }}
              >
                <span style={{ color: getAgentColor(selectedAgent.agent_name) }}>
                  {selectedAgent.agent_name[0]}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                Chat with {selectedAgent.agent_name}
              </h3>
              <p className="text-white/40 text-sm max-w-md">
                {selectedAgent.agent_role === 'Sales Agent' 
                  ? 'I can help you find leads, qualify prospects, and manage outreach campaigns.'
                  : selectedAgent.agent_role === 'Research Agent'
                  ? 'I can research competitors, analyze markets, and build intelligence reports.'
                  : `I'm here to help you with various tasks. What would you like me to do?`}
              </p>
            </div>
          )}

          {messages.length === 0 && !selectedAgent && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Select an Agent</h3>
              <p className="text-white/40 text-sm">Choose an agent from the sidebar to start chatting</p>
            </div>
          )}

          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'agent' && (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ 
                    backgroundColor: getAgentColor(msg.agent_name || '') + '20',
                    color: getAgentColor(msg.agent_name || ''),
                  }}
                >
                  {(msg.agent_name || 'A')[0]}
                </div>
              )}
              <div 
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#e8ff47] text-black' 
                    : 'bg-[#1a1a1a] text-white border border-white/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-black/40' : 'text-white/30'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3">
                <p className="text-white/60 text-sm">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedAgent ? `Message ${selectedAgent.agent_name}...` : 'Select an agent first'}
              disabled={!selectedAgent || loading}
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-white/30 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !selectedAgent || loading}
              className="px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          {!vps && (
            <p className="text-white/30 text-xs mt-2 text-center">
              Connect a VPS to start chatting with agents
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
