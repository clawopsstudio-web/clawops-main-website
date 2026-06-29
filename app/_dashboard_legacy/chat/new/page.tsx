'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Agent Config ────────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a', name: 'Ryan',    color: '#eab308', bg: 'bg-yellow-500',   role: 'Sales Agent',      emoji: '💼' },
  { id: '67965911-391f-4930-ab0b-0f036672f414', name: 'Arjun',   color: '#22c55e', bg: 'bg-green-500',    role: 'Research Agent',   emoji: '🔬' },
  { id: 'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53', name: 'Helena',  color: '#a855f7', bg: 'bg-purple-500',  role: 'Support Agent',    emoji: '🎧' },
]

const NO_AGENT = '00000000-0000-0000-0000-000000000000'

// ─── Channel Config ───────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'ch-general',    name: 'general',   description: 'General team chat' },
  { id: 'ch-sales',      name: 'sales',     description: 'Sales pipeline & outreach' },
  { id: 'ch-research',   name: 'research',  description: 'Market research & intel' },
  { id: 'ch-marketing',  name: 'marketing',  description: 'Content & campaigns' },
]

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent_id: string
  created_at: string
  tool_calls?: ToolCall[]
}

interface ToolCall {
  id: string
  tool: string
  input: Record<string, unknown>
  output?: string
  status: 'running' | 'done' | 'error'
}

interface Channel {
  id: string
  name: string
  description: string
  last_message?: string
  last_time?: string
}

interface DM {
  agentId: string
  name: string
  color: string
  last_message?: string
  last_time?: string
  status: 'online' | 'busy' | 'offline'
}

type SidebarTab = 'channels' | 'direct'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAgent(id: string) {
  return AGENTS.find(a => a.id === id) ?? AGENTS[0]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function groupMessages(msgs: ChatMessage[]) {
  const groups: { msg: ChatMessage; isGrouped: boolean }[] = []
  for (const msg of msgs) {
    const prev = groups[groups.length - 1]
    const sameAuthor = prev && prev.msg.role === msg.role && prev.msg.agent_id === msg.agent_id
    const timeDiff = prev ? new Date(msg.created_at).getTime() - new Date(prev.msg.created_at).getTime() : Infinity
    groups.push({ msg, isGrouped: sameAuthor && timeDiff < 5 * 60 * 1000 })
  }
  return groups
}

// ─── Tool Call Card ─────────────────────────────────────────────────────────────
function ToolCallCard({ tool }: { tool: ToolCall }) {
  return (
    <div className="mt-2 border border-white/10 bg-white/5 rounded-xl p-3 max-w-[480px]">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 rounded bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center">
          <span className="text-[8px]">⚙</span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-[#e8ff47]/70 uppercase tracking-wider">{tool.tool}</span>
        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${tool.status === 'running' ? 'bg-yellow-400 animate-pulse' : tool.status === 'done' ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      <pre className="text-[10px] font-mono text-white/40 overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(tool.input, null, 2).slice(0, 200)}
      </pre>
      {tool.output && (
        <pre className="mt-1.5 text-[10px] font-mono text-green-400/70 overflow-x-auto whitespace-pre-wrap break-all">
          {tool.output.slice(0, 150)}
        </pre>
      )}
    </div>
  )
}

// ─── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ agent }: { agent: { name: string; color: string; bg: string } }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full ${agent.bg} flex items-center justify-center text-[11px] font-bold shrink-0`} style={{ color: agent.color }}>
        {agent.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-white/80 text-xs font-semibold">{agent.name}</span>
          <span className="text-white/20 text-[10px]">typing...</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 150, 300].map(delay => (
              <div key={delay} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isGrouped,
  showAvatar,
}: {
  msg: ChatMessage
  isGrouped: boolean
  showAvatar: boolean
}) {
  const isUser = msg.role === 'user'
  const agent = getAgent(msg.agent_id)
  const color = isUser ? '#0a0a0a' : agent.color
  const bg = isUser ? '#e8ff47' : `${agent.color}15`
  const border = isUser ? '#e8ff47' : `${agent.color}30`
  const nameColor = isUser ? '#0a0a0a' : agent.color

  return (
    <div className={`flex gap-3 ${isGrouped ? 'mt-0.5' : 'mt-4'}`}>
      {/* Avatar column */}
      <div className="w-8 shrink-0 flex flex-col items-center">
        {showAvatar ? (
          isUser ? (
            <div className="w-8 h-8 rounded-full bg-[#e8ff47] flex items-center justify-center text-[11px] font-bold text-black">
              Y
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px]" style={{ backgroundColor: agent.color }}>
              <span className="text-white font-black text-[11px]">{agent.name[0]}</span>
            </div>
          )
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: nameColor }}>
              {isUser ? 'You' : agent.name}
            </span>
            <span className="text-white/20 text-[10px]">{formatTime(msg.created_at)}</span>
          </div>
        )}
        {isGrouped && (
          <div className="text-white/20 text-[10px] mb-0.5 ml-1">
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        <div
          className="inline-block px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap max-w-[640px]"
          style={{ backgroundColor: bg, border: `1px solid ${border}`, color: isUser ? '#0a0a0a' : 'rgba(255,255,255,0.75)' }}
        >
          {msg.content}
        </div>

        {/* Tool calls */}
        {msg.tool_calls?.map(tc => (
          <ToolCallCard key={tc.id} tool={tc} />
        ))}
      </div>
    </div>
  )
}

// ─── Agent Bar ─────────────────────────────────────────────────────────────────
function AgentBar({ onSelect }: { onSelect: (agentId: string) => void }) {
  const [statuses] = useState<Record<string, 'online' | 'busy' | 'offline'>>({
    'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': 'online',
    '67965911-391f-4930-ab0b-0f036672f414': 'online',
    'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': 'busy',
  })

  return (
    <div className="border-t border-white/5 px-4 py-3">
      <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2">Quick Agents</p>
      <div className="flex gap-2">
        {AGENTS.map(agent => {
          const status = statuses[agent.id] ?? 'offline'
          const statusColor = status === 'online' ? 'bg-green-400' : status === 'busy' ? 'bg-yellow-400' : 'bg-white/20'
          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 hover:bg-white/8 transition-all text-left"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white" style={{ backgroundColor: agent.color }}>
                  {agent.name[0]}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a] ${statusColor}`} />
              </div>
              <div>
                <p className="text-white/80 text-[11px] font-semibold leading-none">{agent.name}</p>
                <p className="text-white/30 text-[9px] capitalize mt-0.5">{status}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Channel Sidebar ──────────────────────────────────────────────────────────
function Sidebar({
  activeChannel,
  setActiveChannel,
  activeDM,
  setActiveDM,
  sidebarTab,
  setSidebarTab,
  channels,
  dms,
}: {
  activeChannel: Channel | null
  setActiveChannel: (c: Channel) => void
  activeDM: { agentId: string } | null
  setActiveDM: (d: { agentId: string } | null) => void
  sidebarTab: SidebarTab
  setSidebarTab: (t: SidebarTab) => void
  channels: Channel[]
  dms: DM[]
}) {
  const [newChannelName, setNewChannelName] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)

  const handleNewChannel = () => {
    if (!newChannelName.trim()) return
    const newCh: Channel = {
      id: `ch-${Date.now()}`,
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: '',
    }
    setActiveChannel(newCh)
    setNewChannelName('')
    setShowNewChannel(false)
  }

  return (
    <div className="w-56 bg-[#0e0e0e] border-r border-white/5 flex flex-col shrink-0">
      {/* Workspace header */}
      <div className="px-4 py-3.5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <p className="text-white font-bold text-sm">ClawOps Studio</p>
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white/50 text-[9px]">▼</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setSidebarTab('channels')}
          className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors ${sidebarTab === 'channels' ? 'text-white border-b-2 border-[#e8ff47] text-[#e8ff47]' : 'text-white/40 hover:text-white/70'}`}
        >
          Channels
        </button>
        <button
          onClick={() => setSidebarTab('direct')}
          className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors ${sidebarTab === 'direct' ? 'text-white border-b-2 border-[#e8ff47] text-[#e8ff47]' : 'text-white/40 hover:text-white/70'}`}
        >
          Direct
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {sidebarTab === 'channels' && (
          <div className="space-y-0.5">
            {channels.map(ch => {
              const isActive = activeChannel?.id === ch.id
              return (
                <button
                  key={ch.id}
                  onClick={() => { setActiveChannel(ch); setActiveDM(null) }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}
                >
                  <span className="text-white/30 font-mono">#</span>
                  <span className="truncate">{ch.name}</span>
                </button>
              )
            })}
          </div>
        )}

        {sidebarTab === 'direct' && (
          <div className="space-y-0.5">
            {AGENTS.map(agent => {
              const dm = dms.find(d => d.agentId === agent.id)
              const status = dm?.status ?? 'offline'
              const statusColor = status === 'online' ? 'bg-green-400' : status === 'busy' ? 'bg-yellow-400' : 'bg-white/20'
              const isActive = activeDM?.agentId === agent.id
              return (
                <button
                  key={agent.id}
                  onClick={() => { setActiveDM({ agentId: agent.id }); setActiveChannel(undefined as unknown as Channel) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: agent.color }}>
                      {agent.name[0]}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0e0e0e] ${statusColor}`} />
                  </div>
                  <span className="truncate font-medium">{agent.name}</span>
                  <span className="ml-auto text-[9px] capitalize text-white/25">{status}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Add channel */}
      <div className="p-2 border-t border-white/5">
        {showNewChannel ? (
          <div className="flex gap-1.5">
            <input
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNewChannel()}
              placeholder="channel-name"
              autoFocus
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
            <button onClick={handleNewChannel} className="px-2 py-1.5 bg-[#e8ff47] rounded-lg text-black text-[11px] font-bold">✓</button>
            <button onClick={() => setShowNewChannel(false)} className="px-2 py-1.5 text-white/40 hover:text-white/70 text-[11px]">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewChannel(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-white/40 hover:text-white/70 text-xs rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="text-white/30 text-sm">+</span>
            <span>Add channel</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewChatPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('channels')
  const [activeChannel, setActiveChannel] = useState<Channel | null>(CHANNELS[0])
  const [activeDM, setActiveDM] = useState<{ agentId: string } | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  const groupedMessages = groupMessages(messages)
  const activeAgent = activeDM ? getAgent(activeDM.agentId) : null

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  // Get workspace
  useEffect(() => {
    if (!userId) return
    supabase
      .from('workspaces')
      .select('id')
      .eq('workspace_user_id', userId)
      .limit(1)
      .single()
      .then(({ data }) => { if (data?.id) setWorkspaceId(data.id) })
  }, [userId])

  // Load messages when DM changes
  useEffect(() => {
    if (!activeDM || !workspaceId) return
    const agentId = activeDM.agentId
    fetch(`/api/chat/messages?workspaceId=${workspaceId}&agentId=${agentId}`)
      .then(r => r.json())
      .then(data => { if (data.messages) setMessages(data.messages) })
      .catch(() => setMessages([]))
  }, [activeDM, workspaceId])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, typing])

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      agent_id: activeDM?.agentId ?? NO_AGENT,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          threadId,
          agentId: activeDM?.agentId ?? NO_AGENT,
        }),
      })
      const data = await res.json()

      if (data.threadId) setThreadId(data.threadId)

      // Simulate tool calls for demo purposes (in production these come from Hermes)
      const toolCalls: ToolCall[] = []
      if (data.content?.toLowerCase().includes('search') || data.content?.toLowerCase().includes('find')) {
        toolCalls.push({
          id: `tc-${Date.now()}`,
          tool: 'web_search',
          input: { query: text },
          output: 'Found 5 results',
          status: 'done',
        })
      }

      if (data.content) {
        const aiMsg: ChatMessage = {
          id: `temp-${Date.now() + 1}`,
          role: 'assistant',
          content: data.content,
          agent_id: activeDM?.agentId ?? NO_AGENT,
          created_at: new Date().toISOString(),
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        content: 'Error: Could not reach Hermes.',
        agent_id: activeDM?.agentId ?? NO_AGENT,
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
      setTyping(false)
    }
  }

  // Keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Header title
  const getHeaderTitle = () => {
    if (activeChannel) return `# ${activeChannel.name}`
    if (activeDM) return activeAgent?.name ?? 'Direct Message'
    return 'ClawOps Chat'
  }

  const getHeaderSubtitle = () => {
    if (activeDM) return activeAgent?.role ?? ''
    if (activeChannel) return activeChannel.description
    return ''
  }

  const headerAgent = activeDM ? activeAgent : null

  return (
    <div className="flex h-[calc(100vh-44px)]">
      {/* ── Sidebar ── */}
      <Sidebar
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        activeDM={activeDM}
        setActiveDM={setActiveDM}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        channels={CHANNELS}
        dms={AGENTS.map(a => ({ agentId: a.id, name: a.name, color: a.color, status: 'online' as const }))}
      />

      {/* ── Main chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
          {headerAgent ? (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white" style={{ backgroundColor: headerAgent.color }}>
                {headerAgent.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{headerAgent.name}</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-white/30 text-[11px]">Active</span>
                </div>
                <p className="text-white/30 text-xs">{headerAgent.role}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center text-white/60 text-sm font-mono">#</div>
              <div>
                <p className="text-white font-semibold text-sm">{activeChannel?.name ?? 'Chat'}</p>
                <p className="text-white/30 text-xs">{activeChannel?.description ?? ''}</p>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {activeDM ? (
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl" style={{ backgroundColor: activeAgent?.color }}>
                    {activeAgent?.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{activeAgent?.name}</p>
                    <p className="text-white/30 text-sm">{activeAgent?.role}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white/30 text-xs">Online · Ready to help</span>
                    </div>
                  </div>
                  <p className="text-white/20 text-sm">
                    Start a conversation with {activeAgent?.name}. Ask anything — research, sales, support, or general questions.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      `${activeAgent?.name}, what can you help me with?`,
                      `Give me a quick status update on our pipeline`,
                      `What tools do you have access to?`,
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(prompt)}
                        className="text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/50 text-xs hover:bg-white/10 hover:text-white/80 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeChannel ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                    <span className="text-white/40 text-3xl font-mono">#</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg"># {activeChannel.name}</p>
                    <p className="text-white/30 text-sm">{activeChannel.description}</p>
                  </div>
                  <p className="text-white/20 text-sm">
                    This is the beginning of the <strong className="text-white/40"># {activeChannel.name}</strong> channel.
                  </p>
                </div>
              ) : (
                <div className="text-center text-white/30 text-sm">
                  <p>Select a channel or start a DM to begin.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {groupedMessages.map(({ msg, isGrouped }, idx) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isGrouped={isGrouped}
                  showAvatar={!isGrouped || idx === 0 || groupedMessages[Math.max(0, idx - 1)]?.msg.role !== msg.role}
                />
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {typing && activeAgent && (
            <div className="mt-4">
              <TypingIndicator agent={activeAgent} />
            </div>
          )}

          <div ref={messagesEnd} />
        </div>

        {/* Agent bar */}
        {activeDM && <AgentBar onSelect={id => setActiveDM({ agentId: id })} />}

        {/* Input */}
        {activeDM ? (
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <div className="flex-1 flex items-end bg-[#111] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeAgent?.name ?? 'agent'}...`}
                  disabled={sending}
                  rows={1}
                  className="flex-1 bg-transparent text-white/70 text-sm placeholder:text-white/20 focus:outline-none resize-none disabled:opacity-40"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-5 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-2xl disabled:opacity-40 shrink-0 transition-colors"
              >
                {sending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : 'Send'}
              </button>
            </div>
            <p className="text-white/20 text-[10px] mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
          </div>
        ) : (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-white/30 text-sm">
              <span className="text-white/20 text-lg">💬</span>
              <span>Select a direct message to start chatting with an agent</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
