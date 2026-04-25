'use client'

export const metadata = { title: 'Chat — ClawOps' }

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'
const NO_AGENT = '00000000-0000-0000-0000-000000000000'

const AGENT_COLORS: Record<string, { bg: string; text: string }> = {
  Ryan: { bg: 'bg-blue-500', text: 'text-blue-400' },
  Arjun: { bg: 'bg-purple-500', text: 'text-purple-400' },
  Helena: { bg: 'bg-green-500', text: 'text-green-400' },
  Agent: { bg: 'bg-white/10', text: 'text-white/60' },
  You: { bg: 'bg-[#e8ff47]', text: 'text-[#0a0a0a]' },
}

const SUGGESTED_PROMPTS_ADMIN = [
  'Ryan, find me 10 promising SaaS startups from Product Hunt this week',
  "Arjun, research our top 3 competitors' pricing strategies",
  'Helena, draft a reply to an angry customer who waited 3 days for a response',
]

interface Message {
  id: string
  sender_name: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  agent_id?: string
}

interface ThreadPreview {
  agent_id: string
  agent_name: string
  last_message: string
  last_time: string
}

export default function ChatPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [threads, setThreads] = useState<ThreadPreview[]>([])
  const [activeThread, setActiveThread] = useState<string>(NO_AGENT)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? '')
    })
  }, [])

  // Load thread list
  useEffect(() => {
    if (!userId) return
    supabase
      .from('chat_messages')
      .select('agent_id, sender_name, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!data) return
        // Group by agent_id to build thread list
        const seen = new Map<string, ThreadPreview>()
        for (const m of data) {
          const aid = m.agent_id ?? NO_AGENT
          if (!seen.has(aid)) {
            seen.set(aid, {
              agent_id: aid,
              agent_name: m.sender_name ?? 'General',
              last_message: m.content.slice(0, 50),
              last_time: m.created_at,
            })
          }
        }
        setThreads(Array.from(seen.values()))
        // Auto-select first thread
        if (seen.size > 0 && activeThread === NO_AGENT) {
          setActiveThread(seen.values().next().value?.agent_id ?? NO_AGENT)
        }
      })
  }, [userId])

  // Load messages for selected thread
  useEffect(() => {
    if (!userId || activeThread === NO_AGENT) return
    const q = supabase
      .from('chat_messages')
      .select('id, sender_name, role, content, agent_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    const filtered = activeThread !== NO_AGENT ? q.eq('agent_id', activeThread) : q
    filtered.then(({ data }) => {
      if (data) setMessages(data as Message[])
      messagesEnd.current?.scrollIntoView()
    })
  }, [userId, activeThread])

  const send = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_name: 'You',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
      agent_id: activeThread,
    }
    setMessages(prev => [...prev, tempMsg])
    messagesEnd.current?.scrollIntoView()

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agentId: activeThread === NO_AGENT ? undefined : activeThread }),
      })
      const data = await res.json()
      if (data.content) {
        // Add AI response
        const threadThreads = threads.find(t => t.agent_id === activeThread)
        setMessages(prev => [...prev, {
          id: `temp-${Date.now() + 1}`,
          sender_name: threadThreads?.agent_name ?? 'Agent',
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString(),
          agent_id: activeThread,
        }])
        // Refresh thread list
        if (userId) {
          supabase
            .from('chat_messages')
            .select('agent_id, sender_name, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100)
            .then(({ data: d }) => {
              if (!d) return
              const seen = new Map<string, ThreadPreview>()
              for (const m of d) {
                const aid = m.agent_id ?? NO_AGENT
                if (!seen.has(aid)) {
                  seen.set(aid, {
                    agent_id: aid,
                    agent_name: m.sender_name ?? 'General',
                    last_message: m.content.slice(0, 50),
                    last_time: m.created_at,
                  })
                }
              }
              setThreads(Array.from(seen.values()))
            })
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `temp-${Date.now()}`,
        sender_name: 'Agent',
        role: 'assistant',
        content: 'Error: Could not reach Hermes.',
        created_at: new Date().toISOString(),
        agent_id: activeThread,
      }])
    } finally {
      setSending(false)
      messagesEnd.current?.scrollIntoView()
    }
  }

  const isAdmin = userId === ADMIN_USER_ID
  const activeThreadName = threads.find(t => t.agent_id === activeThread)?.agent_name ?? 'All Agents'

  return (
    <div className="flex h-[calc(100vh-44px)]">
      {/* ── Left panel: thread list ── */}
      <div className="w-56 bg-[#111] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {threads.length === 0 && (
            <div className="px-3 py-4 text-white/20 text-xs text-center">
              No conversations yet.
            </div>
          )}
          {threads.map(thread => {
            const color = AGENT_COLORS[thread.agent_name] ?? AGENT_COLORS.Agent
            return (
              <button
                key={thread.agent_id}
                onClick={() => setActiveThread(thread.agent_id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                  activeThread === thread.agent_id
                    ? 'bg-[#1a1a1a] text-white font-semibold'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-5 h-5 rounded-full ${color.bg} flex items-center justify-center text-[8px] font-bold ${color.text}`}>
                    {thread.agent_name[0]}
                  </div>
                  <span className="truncate">{thread.agent_name}</span>
                </div>
                <div className="text-white/30 truncate pl-7 text-[10px]">
                  {thread.last_message}
                </div>
              </button>
            )
          })}
        </div>
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => { setActiveThread(NO_AGENT) }}
            className={`w-full text-left px-3 py-2 text-white/30 hover:text-white/60 text-xs flex items-center gap-2 rounded-lg hover:bg-white/4 transition-colors ${activeThread === NO_AGENT ? 'text-white/60' : ''}`}
          >
            <span className="text-white/40">+</span>
            All Agents
          </button>
        </div>
      </div>

      {/* ── Chat main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thread header */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full ${(AGENT_COLORS[activeThreadName] ?? AGENT_COLORS.Agent).bg} flex items-center justify-center text-xs font-bold ${(AGENT_COLORS[activeThreadName] ?? AGENT_COLORS.Agent).text}`}>
            {activeThreadName[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{activeThreadName}</p>
            <p className="text-white/30 text-xs">AI Agent</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-12">
              {isAdmin && SUGGESTED_PROMPTS_ADMIN.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-white/20 text-sm">
                    <p>Your team is ready. What would you like to do?</p>
                    <p className="text-xs mt-1 text-white/15">Pick a prompt below or type your own</p>
                  </div>
                  <div className="flex flex-col gap-2 max-w-md mx-auto">
                    {SUGGESTED_PROMPTS_ADMIN.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(prompt) }}
                        className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white/60 text-xs hover:bg-white/10 hover:text-white/80 hover:border-white/15 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center mt-20 text-white/20 text-sm">
                  <p>No messages in this conversation.</p>
                  <p className="text-xs mt-1">Start talking to your agent.</p>
                </div>
              )}
            </div>
          )}
          {messages.map(msg => {
            const color = AGENT_COLORS[msg.sender_name] ?? (msg.role === 'user' ? AGENT_COLORS.You : AGENT_COLORS.Agent)
            const isUser = msg.role === 'user'
            return (
              <div key={msg.id} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full ${color.bg} flex items-center justify-center text-[10px] font-bold shrink-0 ${color.text}`}>
                  {msg.sender_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white/80 text-xs font-semibold">{msg.sender_name}</span>
                    <span className="text-white/20 text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={`Message ${activeThreadName}...`}
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
