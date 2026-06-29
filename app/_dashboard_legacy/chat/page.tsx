'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Agent {
  id: string
  name: string
  role: string
  color: string
  profile: string
  description: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Thread {
  id: string
  title: string
  agent_id: string | null
  last_message: string | null
  updated_at: string
}

const AGENT_COLORS: Record<string, string> = {
  sales: '#22c55e',
  research: '#f59e0b',
  marketing: '#f97316',
  devops: '#8b5cf6',
  general: '#6366f1',
}

const AGENT_ICONS: Record<string, string> = {
  sales: '💼',
  research: '🔬',
  marketing: '📣',
  devops: '⚡',
  general: '🤖',
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const initialAgentId = searchParams.get('agent')

  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [currentStreamingContent, setCurrentStreamingContent] = useState('')
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [showThreads, setShowThreads] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!workspace) return

      // Fetch agents
      const response = await fetch(`/api/agents?workspaceId=${workspace.id}`)
      const data = await response.json()

      if (data.agents) {
        setAgents(data.agents)

        // Select initial agent if provided
        if (initialAgentId) {
          const agent = data.agents.find((a: Agent) => a.id === initialAgentId)
          if (agent) setSelectedAgent(agent)
        } else if (data.agents.length > 0 && !selectedAgent) {
          setSelectedAgent(data.agents[0])
        }
      }
    }
    loadAgents()
  }, [initialAgentId])

  // Load threads
  useEffect(() => {
    async function loadThreads() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!workspace) return

      const response = await fetch(`/api/chat?workspaceId=${workspace.id}`)
      const data = await response.json()

      if (data.sessions) {
        setThreads(data.sessions)
      }
    }
    loadThreads()
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (!streaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streaming])

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading || streaming) return

    const userMessage = input.trim()
    const userMsgId = `user-${Date.now()}`
    setInput('')
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userMessage, timestamp: new Date() }])
    setLoading(true)

    try {
      // Call streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agentId: selectedAgent.id,
          profile: selectedAgent.profile,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      // Handle streaming response
      setLoading(false)
      setStreaming(true)
      setCurrentStreamingContent('')

      const assistantMsgId = `assistant-${Date.now()}`
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response stream')

      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        // Parse SSE data
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk' && data.content) {
                fullResponse += data.content
                setCurrentStreamingContent(fullResponse)
              } else if (data.type === 'error') {
                throw new Error(data.error)
              } else if (data.type === 'done') {
                // Complete
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      // Add complete message
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: fullResponse, timestamp: new Date() }])
      setCurrentStreamingContent('')
      setStreaming(false)

    } catch (err: any) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
      setStreaming(false)
      setCurrentStreamingContent('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const loadThread = (thread: Thread) => {
    setSelectedThread(thread)
    setMessages([])
    setShowThreads(false)
  }

  const getAgentIcon = (role: string) => AGENT_ICONS[role] || AGENT_ICONS.general
  const getAgentColor = (role: string) => AGENT_COLORS[role] || AGENT_COLORS.general

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0a0a]">
      {/* Agent Sidebar */}
      <div className="w-64 bg-[#111] border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white/40 text-xs font-semibold uppercase mb-3">Agents</h2>
          <div className="space-y-1">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent)
                  setSelectedThread(null)
                  setMessages([])
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-colors ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: (agent.color || getAgentColor(agent.role)) + '20', color: agent.color || getAgentColor(agent.role) }}
                  >
                    {getAgentIcon(agent.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-white/30 text-[10px] truncate capitalize">{agent.role}</p>
                  </div>
                </div>
              </button>
            ))}
            {agents.length === 0 && (
              <p className="text-white/30 text-xs px-2 py-4 text-center">No agents available</p>
            )}
          </div>
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white/40 text-xs font-semibold uppercase">Recent Chats</h2>
              <button
                onClick={() => setShowThreads(!showThreads)}
                className="text-white/30 hover:text-white text-xs"
              >
                {showThreads ? 'Hide' : 'Show'}
              </button>
            </div>
            {showThreads && (
              <div className="space-y-1">
                {threads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => loadThread(thread)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white/70 text-xs truncate">{thread.title || 'Untitled'}</p>
                    <p className="text-white/30 text-[10px] truncate mt-0.5">
                      {thread.last_message || 'No messages'}
                    </p>
                  </button>
                ))}
                {threads.length === 0 && (
                  <p className="text-white/30 text-xs py-2">No chat history yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#111] border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            {selectedAgent ? (
              <>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: (selectedAgent.color || getAgentColor(selectedAgent.role)) + '20', color: selectedAgent.color || getAgentColor(selectedAgent.role) }}
                >
                  {getAgentIcon(selectedAgent.role)}
                </div>
                <div>
                  <h2 className="text-white font-semibold">{selectedAgent.name}</h2>
                  <p className="text-white/40 text-xs">
                    {selectedAgent.role} • Ready to help
                  </p>
                </div>
              </>
            ) : (
              <p className="text-white/40 text-sm">Select an agent to start chatting</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && selectedAgent && (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ backgroundColor: (selectedAgent.color || getAgentColor(selectedAgent.role)) + '20', color: selectedAgent.color || getAgentColor(selectedAgent.role) }}
              >
                {getAgentIcon(selectedAgent.role)}
              </div>
              <h3 className="text-white font-semibold mb-1">Chat with {selectedAgent.name}</h3>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                {selectedAgent.description || `${selectedAgent.role} agent ready to assist you`}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[#e8ff47] text-black'
                  : 'bg-white/10 text-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.role === 'user' ? 'text-black/40' : 'text-white/30'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming content */}
          {streaming && currentStreamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white/10 text-white">
                <p className="text-sm whitespace-pre-wrap">{currentStreamingContent}</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && !streaming && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#111] border-t border-white/10 p-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Select an agent to chat'}
              disabled={!selectedAgent}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[200px]"
              rows={1}
              style={{
                height: 'auto',
                overflow: 'hidden'
              }}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 200) + 'px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !selectedAgent || loading || streaming}
              className="px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || streaming ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
          <p className="text-white/30 text-[10px] mt-2 text-center">
            {selectedAgent ? `Press Enter to send, Shift+Enter for new line` : 'Select an agent to start chatting'}
          </p>
        </div>
      </div>
    </div>
  )
}
