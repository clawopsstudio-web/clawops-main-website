'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_UID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

// Agent display info — keyed by agent UUID
const AGENT_MAP: Record<string, { name: string; color: string; bg: string }> = {
  '00000000-0000-0000-0000-000000000000': { name: 'General', color: 'text-white',   bg: 'bg-white/20' },
  'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': { name: 'Ryan',   color: 'text-blue-400',   bg: 'bg-blue-500' },
  '67965911-391f-4930-ab0b-0f036672f414': { name: 'Arjun',  color: 'text-yellow-400', bg: 'bg-yellow-500' },
  'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': { name: 'Helena', color: 'text-green-400',  bg: 'bg-green-500' },
}

function getAgent(id?: string): { name: string; color: string; bg: string } {
  if (!id) return AGENT_MAP['00000000-0000-0000-0000-000000000000']
  return AGENT_MAP[id] ?? { name: 'Agent', color: 'text-white/60', bg: 'bg-white/10' }
}

const SUGGESTED_PROMPTS_ADMIN = [
  'Ryan, find me 10 SaaS founders in London on LinkedIn',
  "Arjun, research our top 3 competitors' pricing strategies",
  'Helena, draft a reply to an angry customer who waited 3 days',
]

interface Message {
  id: string
  agent_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Thread {
  id: string
  agent_id: string
  title: string
  last_message: string
  last_time: string
  created_at: string
}

export default function ChatPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  // Load thread list from API
  useEffect(() => {
    if (!userId) return
    fetch('/api/chat/threads')
      .then(r => r.json())
      .then(data => {
        if (data.threads) {
          setThreads(data.threads)
          setWorkspaceId(data.workspaceId ?? null)
          // Auto-select first thread if none selected
          if (!activeThread && data.threads.length > 0) {
            setActiveThread(data.threads[0])
          }
        }
      })
      .catch(err => console.error('Failed to load threads:', err))
  }, [userId])

  // Load messages when thread changes
  useEffect(() => {
    if (!activeThread) return
    fetch(`/api/chat/messages?threadId=${activeThread.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages) setMessages(data.messages)
        messagesEnd.current?.scrollIntoView()
      })
      .catch(err => console.error('Failed to load messages:', err))
  }, [activeThread])

  const send = async () => {
    if (!input.trim() || sending || !activeThread) return
    const text = input.trim()
    setInput('')
    setSending(true)

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      agent_id: activeThread.agent_id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])
    messagesEnd.current?.scrollIntoView()

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          threadId: activeThread.id,
          agentId: activeThread.agent_id,
        }),
      })
      const data = await res.json()
      if (data.content) {
        const aiMsg: Message = {
          id: `temp-${Date.now() + 1}`,
          agent_id: activeThread.agent_id,
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, aiMsg])

        // If this was a new thread, the response includes the threadId
        if (data.threadId && data.threadId !== activeThread.id) {
          // Reload threads to pick up the new thread
          const threadsRes = await fetch('/api/chat/threads')
          const threadsData = await threadsRes.json()
          if (threadsData.threads) {
            setThreads(threadsData.threads)
            const newThread = threadsData.threads.find(
              (t: Thread) => t.id === data.threadId
            )
            if (newThread) setActiveThread(newThread)
          }
        } else {
          // Update last message preview in thread list
          setThreads(prev =>
            prev.map(t =>
              t.id === activeThread.id
                ? { ...t, last_message: data.content.slice(0, 60), last_time: new Date().toISOString() }
                : t
            )
          )
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `temp-${Date.now()}`,
        agent_id: activeThread.agent_id,
        role: 'assistant',
        content: 'Error: Could not reach Hermes.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
      messagesEnd.current?.scrollIntoView()
    }
  }

  const startNewConversation = () => {
    // Select "General" agent as default for new conversation
    const generalThread: Thread = {
      id: '',
      agent_id: '00000000-0000-0000-0000-000000000000',
      title: 'New conversation',
      last_message: '',
      last_time: '',
      created_at: '',
    }
    setActiveThread(generalThread)
    setMessages([])
  }

  const isAdmin = userId === ADMIN_UID
  const activeAgent = getAgent(activeThread?.agent_id)
  const displayName = activeThread?.title && activeThread.title !== 'New conversation'
    ? activeThread.title
    : activeAgent.name

  return (
    <div className="flex h-[calc(100vh-44px)]">
      {/* Thread list */}
      <div className="w-56 bg-[#111] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Conversations</p>
          <button
            onClick={startNewConversation}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/60 text-xs flex items-center justify-center transition-colors"
            title="New conversation"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {threads.length === 0 && (
            <div className="px-3 py-4 text-white/20 text-xs text-center">
              No conversations yet.<br />Start one below.
            </div>
          )}
          {threads.map(t => {
            const a = getAgent(t.agent_id)
            const isActive = activeThread?.id === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveThread(t)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                  isActive ? 'bg-[#1a1a1a] text-white font-semibold' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-5 h-5 rounded-full ${a.bg} flex items-center justify-center text-[8px] font-bold ${a.color}`}>
                    {a.name[0]}
                  </div>
                  <span className="truncate">{a.name}</span>
                </div>
                <div className="text-white/30 truncate pl-7 text-[10px]">{t.last_message || t.title}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full ${activeAgent.bg} flex items-center justify-center text-xs font-bold ${activeAgent.color}`}>
            {activeAgent.name[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{displayName}</p>
            <p className="text-white/30 text-xs">AI Agent</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-12">
              {isAdmin ? (
                <div className="space-y-4">
                  <div className="text-white/20 text-sm">
                    <p>Your team is ready. What would you like to do?</p>
                    <p className="text-xs mt-1 text-white/15">Pick a prompt below or type your own</p>
                  </div>
                  <div className="flex flex-col gap-2 max-w-md mx-auto">
                    {SUGGESTED_PROMPTS_ADMIN.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(p)}
                        className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white/60 text-xs hover:bg-white/10 hover:text-white/80 transition-all"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-20 text-white/20 text-sm">
                  <p>No messages yet.</p>
                  <p className="text-xs mt-1">Start a conversation.</p>
                </div>
              )}
            </div>
          )}
          {messages.map(msg => {
            const isUser = msg.role === 'user'
            const a = getAgent(msg.agent_id)
            const color = isUser ? 'bg-[#e8ff47]' : a.bg
            const textColor = isUser ? 'text-[#0a0a0a]' : a.color
            const name = isUser ? 'You' : a.name
            return (
              <div key={msg.id} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-[10px] font-bold shrink-0 ${textColor}`}>
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white/80 text-xs font-semibold">{name}</span>
                    <span className="text-white/20 text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          })}
          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-3">
              <div className={`w-7 h-7 rounded-full ${activeAgent.bg} flex items-center justify-center text-[10px] font-bold shrink-0 ${activeAgent.color}`}>
                {activeAgent.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-white/80 text-xs font-semibold">{activeAgent.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={`Message ${activeAgent.name}...`}
              disabled={sending}
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 disabled:opacity-40"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="px-4 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl disabled:opacity-40 shrink-0"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
