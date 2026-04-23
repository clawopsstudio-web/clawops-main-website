'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Agent { id: string; name: string; role: string }
interface Message { id: string; agent_name: string; role: 'user' | 'agent'; content: string; created_at: string }

export default function ChatPage() {
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [activeAgent, setActiveAgent] = useState<string>('all')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  // Load agents
  useEffect(() => {
    supabase.from('agents').select('id, name, role').then(({ data }) => {
      if (data) setAgents(data)
    })
  }, [])

  // Load messages for active agent
  useEffect(() => {
    let q = supabase.from('missions').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(20)
    if (activeAgent !== 'all') q = q.eq('agent_id', activeAgent)
    q.then(({ data }) => {
      if (data) setMessages(data.map((m: any) => ({
        id: m.id, agent_name: m.agent_id ?? 'Agent', role: 'agent' as const, content: m.title ?? '', created_at: m.created_at
      })))
    })
    messagesEnd.current?.scrollIntoView()
  }, [activeAgent])

  const send = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    // Optimistic add
    const tempId = Date.now().toString()
    setMessages(prev => [...prev, { id: tempId, agent_name: 'You', role: 'user', content: text, created_at: new Date().toISOString() }])

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agentId: activeAgent }),
      })
      const data = await res.json()
      if (data.content) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          agent_name: 'Agent',
          role: 'agent',
          content: data.content,
          created_at: new Date().toISOString(),
        }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), agent_name: 'Agent', role: 'agent', content: 'Error: Could not reach Hermes.', created_at: new Date().toISOString() }])
    } finally {
      setSending(false)
      messagesEnd.current?.scrollIntoView()
    }
  }

  return (
    <div className="flex h-[calc(100vh-44px)]">
      {/* ── Left panel ── */}
      <div className="w-56 bg-[#111] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Agents</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          <button
            onClick={() => setActiveAgent('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
              activeAgent === 'all' ? 'bg-[#1a1a1a] text-white font-semibold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span className="text-[10px] opacity-50">#</span>
            all-agents
          </button>
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAgent(a.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                activeAgent === a.id ? 'bg-[#1a1a1a] text-white font-semibold' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span className="text-[10px] opacity-50">#</span>
              {a.name.toLowerCase().replace(/\s+/g, '-')}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-white/5">
          <button className="w-full text-left px-3 py-2 text-white/30 hover:text-white/60 text-xs flex items-center gap-2">
            <span className="text-white/40">+</span>
            New Agent
          </button>
        </div>
      </div>

      {/* ── Chat main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-white/20 text-sm">
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Start a conversation with your agents.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0">
                {msg.role === 'user' ? 'Y' : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-white/80 text-xs font-semibold">{msg.agent_name}</span>
                  <span className="text-white/20 text-[10px]">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white/60 text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Message your agents..."
              disabled={sending}
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 disabled:opacity-40"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="px-4 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
