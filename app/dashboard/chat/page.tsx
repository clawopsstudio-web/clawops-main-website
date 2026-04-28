'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Agent {
  id: string
  hermes_agent_id: string
  agent_name: string
  agent_role: string
  status: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [vpsUrl, setVpsUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get user's VPS
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: vps } = await supabase
        .from('vps_instances')
        .select('tunnel_url')
        .eq('user_id', user.id)
        .single()
      
      if (vps) setVpsUrl(vps.tunnel_url)

      // Get user's agents
      const { data: agentsData } = await supabase
        .from('vps_agents')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
      
      if (agentsData && agentsData.length > 0) {
        setAgents(agentsData)
        setSelectedAgent(agentsData[0])
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }])
    setLoading(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agentId: selectedAgent.id,
          agentName: selectedAgent.agent_name,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${data.error}`, 
          timestamp: new Date() 
        }])
      } else if (data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response, 
          timestamp: new Date() 
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Got your message! I\'ll work on that.', 
          timestamp: new Date() 
        }])
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${err.message}`, 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Agent Sidebar */}
      <div className="w-64 bg-[#111] border-r border-white/10 p-4">
        <h2 className="text-white/40 text-xs font-semibold uppercase mb-4">Agents</h2>
        <div className="space-y-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                selectedAgent?.id === agent.id 
                  ? 'bg-white/10 border border-white/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                  agent.agent_name === 'Ryan' ? 'bg-emerald-500/20 text-emerald-400' :
                  agent.agent_name === 'Arjun' ? 'bg-yellow-500/20 text-yellow-400' :
                  agent.agent_name === 'Tyler' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {agent.agent_name[0]}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{agent.agent_name}</p>
                  <p className="text-white/40 text-xs">{agent.agent_role || 'Agent'}</p>
                </div>
              </div>
            </button>
          ))}
          {agents.length === 0 && (
            <p className="text-white/30 text-sm">No agents available</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#111] border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            {selectedAgent && (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  selectedAgent.agent_name === 'Ryan' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedAgent.agent_name === 'Arjun' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedAgent.agent_name[0]}
                </div>
                <div>
                  <h2 className="text-white font-semibold">{selectedAgent.agent_name}</h2>
                  <p className="text-white/40 text-xs">
                    {selectedAgent.agent_role || 'AI Agent'}
                    {vpsUrl && <span className="ml-2 text-emerald-400">● Online</span>}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && selectedAgent && (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${
                selectedAgent.agent_name === 'Ryan' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedAgent.agent_name === 'Arjun' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {selectedAgent.agent_name[0]}
              </div>
              <h3 className="text-white font-semibold mb-1">Chat with {selectedAgent.agent_name}</h3>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                {selectedAgent.agent_role === 'Sales Agent' && 'I can help you with outreach, lead generation, and sales tasks.'}
                {selectedAgent.agent_role === 'Research Agent' && 'I can research topics, analyze competitors, and gather market intelligence.'}
                {selectedAgent.agent_role === 'Marketing Agent' && 'I can create content, manage social media, and run marketing campaigns.'}
                {!selectedAgent.agent_role && 'I\'m ready to help you with any task.'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

          {loading && (
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
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedAgent ? `Message ${selectedAgent.agent_name}...` : 'Select an agent to chat'}
              disabled={!selectedAgent}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  )
}
