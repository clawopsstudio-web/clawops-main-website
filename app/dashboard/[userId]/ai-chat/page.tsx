'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { Send, Bot, User, Sparkles, Zap, Code, Server, Shield, MessageSquare } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  icon: React.ReactNode
  color: string
  description: string
}

interface Message {
  id: string
  agentId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AGENTS: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Henry',
    role: 'Chief AI Officer · Co-Founder',
    icon: <Sparkles size={16} />,
    color: '#e8ff47',
    description: 'Your AI co-founder. Strategic thinking, product decisions, and big-picture planning.',
  },
  {
    id: 'dev',
    name: 'Ryan',
    role: 'Senior Developer',
    icon: <Code size={16} />,
    color: '#A855F7',
    description: 'Full-stack development, architecture, code review, and technical implementation.',
  },
  {
    id: 'arjun',
    name: 'Arjun',
    role: 'Infrastructure & Security',
    icon: <Server size={16} />,
    color: '#10B981',
    description: 'VPS management, DevOps, system monitoring, and security hardening.',
  },
  {
    id: 'kyle',
    name: 'Kyle',
    role: 'Frontend Engineer',
    icon: <Zap size={16} />,
    color: '#F59E0B',
    description: 'UI/UX, React, animations, and everything that runs in the browser.',
  },
  {
    id: 'support',
    name: 'ZeroClaw',
    role: 'Support Agent',
    icon: <Shield size={16} />,
    color: '#EC4899',
    description: 'Customer support, troubleshooting, FAQs, and onboarding guidance.',
  },
]

interface Props {
  params: Promise<{ userId: string }>
}

function ChatMessage({ message }: { message: Message }) {
  const agent = AGENTS.find(a => a.id === message.agentId)
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{
          background: isUser ? 'rgba(255,255,255,0.1)' : `${agent?.color}20`,
          color: isUser ? 'rgba(255,255,255,0.6)' : agent?.color,
          border: isUser ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${agent?.color}30`,
        }}
      >
        {isUser ? <User size={14} /> : (agent?.icon || <Bot size={14} />)}
      </div>

      {/* Bubble */}
      <div className="max-w-[75%]">
        {!isUser && agent && (
          <div className="text-xs font-medium mb-1" style={{ color: agent.color }}>
            {agent.name}
          </div>
        )}
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: isUser ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          }}
        >
          <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-right' : ''}`} style={{ color: 'rgba(255,255,255,0.25)' }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function AIChatPage(_props: Props) {
  const [selectedAgent, setSelectedAgent] = useState('orchestrator')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAgentPicker, setShowAgentPicker] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const activeAgent = AGENTS.find(a => a.id === selectedAgent)!

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem(`clawops-chat-${selectedAgent}`)
      if (history) {
        const parsed = JSON.parse(history)
        setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    }
  }, [selectedAgent])

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(`clawops-chat-${selectedAgent}`, JSON.stringify(messages))
    } catch {}
  }, [messages, selectedAgent])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      agentId: selectedAgent,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // Send to our backend API which communicates with the OpenClaw gateway
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          message: currentInput.trim(),
          history: messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          agentId: selectedAgent,
          role: 'assistant',
          content: data.response || data.message || "I'm here! How can I help you today?",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Fallback: use a pre-programmed response if API is not available
        const fallback: Message = {
          id: crypto.randomUUID(),
          agentId: selectedAgent,
          role: 'assistant',
          content: getFallbackResponse(currentInput.trim(), selectedAgent),
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, fallback])
      }
    } catch {
      // Network error - use fallback
      const fallback: Message = {
        id: crypto.randomUUID(),
        agentId: selectedAgent,
        role: 'assistant',
        content: getFallbackResponse(currentInput.trim(), selectedAgent),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallback])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <DashboardShell>
      <div className="flex h-full">
        {/* Agent sidebar */}
        <div
          className="w-64 flex-shrink-0 border-r overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div className="p-4">
            <h2 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
              <MessageSquare size={14} />
              AI Agents
            </h2>
            <div className="space-y-1.5">
              {AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent.id)
                    setShowAgentPicker(false)
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: selectedAgent === agent.id ? `${agent.color}15` : 'transparent',
                    border: selectedAgent === agent.id ? `1px solid ${agent.color}30` : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: `${agent.color}20`, color: agent.color }}
                    >
                      {agent.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{agent.name}</div>
                      <div className="text-xs text-white/30 truncate">{agent.role.split('·')[0].trim()}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-white/30 mb-2">Quick actions</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMessages([])
                  localStorage.removeItem(`clawops-chat-${selectedAgent}`)
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-white/40 transition-colors hover:text-white/60"
                style={{ background: 'transparent' }}
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div
            className="px-5 py-4 border-b flex items-center gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${activeAgent.color}20`, color: activeAgent.color }}
            >
              {activeAgent.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{activeAgent.name}</h3>
              <p className="text-xs text-white/40">{activeAgent.role}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Online</span>
            </div>
          </div>

          {/* Agent description */}
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.03)', background: `${activeAgent.color}08` }}>
            <p className="text-xs text-white/40">{activeAgent.description}</p>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-5"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${activeAgent.color}15`, color: activeAgent.color }}
                >
                  {activeAgent.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chat with {activeAgent.name}</h3>
                <p className="text-sm text-white/40 max-w-sm">
                  {activeAgent.description} Ask anything — I'm here to help.
                </p>
                {/* Suggested prompts */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
                  {getSuggestedPrompts(selectedAgent).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1.5 rounded-lg text-xs text-white/50 transition-colors hover:text-white/80"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activeAgent.color}20`, color: activeAgent.color }}
                >
                  {activeAgent.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium" style={{ color: activeAgent.color }}>{activeAgent.name}</span>
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: activeAgent.color, animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: activeAgent.color, animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: activeAgent.color, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="p-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
          >
            <div
              className="flex items-end gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeAgent.name}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none focus:outline-none"
                style={{ maxHeight: '120px' }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                style={{ background: input.trim() ? activeAgent.color : 'rgba(255,255,255,0.1)', color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)' }}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-xs text-white/20 mt-2 text-center">
              AI responses may be inaccurate. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function getSuggestedPrompts(agentId: string): string[] {
  const prompts: Record<string, string[]> = {
    orchestrator: ['Build a feature roadmap for my SaaS', 'How do I grow to $100k/month?', 'Review our current architecture'],
    dev: ['Write a React component for a dashboard', 'How do I set up Supabase auth?', 'Optimize my database queries'],
    arjun: ['Set up monitoring for my VPS', 'Configure nginx for my app', 'Best practices for VPS security'],
    kyle: ['Design a landing page CTA section', 'Fix mobile responsiveness', 'Add dark mode to my app'],
    support: ['How do I get started?', 'Connect my first integration', 'What can I automate?'],
  }
  return prompts[agentId] || ['How can you help me?']
}

function getFallbackResponse(message: string, agentId: string): string {
  const lower = message.toLowerCase()
  
  if (agentId === 'orchestrator') {
    if (lower.includes('help') || lower.includes('what can you do')) {
      return "I'm Henry, your AI co-founder. I can help you with strategic planning, product decisions, competitive analysis, roadmap building, and growing your business to $100k/month. What would you like to work on?"
    }
    if (lower.includes('revenue') || lower.includes('money') || lower.includes('grow')) {
      return "Revenue growth at this stage comes down to 3 things: 1) Getting your first 10 paying clients fast (even at $299/month), 2) Building referral loops into every interaction, 3) Doubling down on what works. Want me to help you build a growth playbook?"
    }
    return "Got it. I'm thinking through this... The key considerations are your current infrastructure setup, your target market, and how quickly you need to ship. Let's drill into specifics — what constraint is most pressing right now?"
  }
  
  if (agentId === 'dev') {
    if (lower.includes('error') || lower.includes('bug') || lower.includes('fix')) {
      return "Happy to help debug. Can you share the error message and which file/line it's happening on? Screenshots or code snippets both work. I'll dig into the root cause and give you a fix."
    }
    return "I'm Ryan, your senior developer. I can help with code implementation, architecture decisions, debugging, code review, and technical planning. What are you building or what do you need help with?"
  }
  
  if (agentId === 'support') {
    return "Hi! I'm ZeroClaw, your support agent. I can help you get started, troubleshoot issues, set up integrations, and answer questions about ClawOps. What do you need help with today?"
  }
  
  return "That's a great question. Let me think about this and give you a thorough answer. What specific aspect would you like to focus on first?"
}
