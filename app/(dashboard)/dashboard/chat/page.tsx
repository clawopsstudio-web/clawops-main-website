'use client';

// ============================================================================
// ClawOps Studio — Chat Page
// Phase 1 MVP
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { MOCK_CHAT_MESSAGES, MOCK_AGENT_SESSIONS } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card from '@/components/dashboard/Card';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function ChatPage() {
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [activeSession] = useState(MOCK_AGENT_SESSIONS[0]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      id: 'msg_' + Date.now(),
      sessionId: activeSession.id,
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString(),
      metadata: { tokensUsed: Math.floor(Math.random() * 60) + 20, model: activeSession.agentModel, duration: '0.5s' },
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_' + Date.now() + 1,
          sessionId: activeSession.id,
          role: 'assistant',
          content: "Got it. I'm working on that now. Let me check the current system state and get back to you with a detailed analysis.",
          timestamp: new Date().toISOString(),
          metadata: { tokensUsed: Math.floor(Math.random() * 200) + 100, model: activeSession.agentModel, duration: '2.1s' },
        },
      ]);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-48px)]">
      <PageHeader
        title="Chat"
        description={`Session with ${activeSession.customAgentName}`}
        badge="ACTIVE"
        badgeColor="bg-green-400/10 text-green-400 border-green-400/20"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/50 font-mono">{activeSession.agentModel}</span>
            </div>
          </div>
        }
      />

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden mb-4" noPadding>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/20'
                    : msg.role === 'system'
                    ? 'bg-violet-500/10 border border-violet-500/20'
                    : 'bg-white/[0.04] border border-white/[0.08]'
                } rounded-2xl px-4 py-3`}
              >
                {msg.role !== 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#00D4FF]/15 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      </svg>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">Henry</span>
                  </div>
                )}
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.metadata && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[9px] font-mono text-white/20">
                      {msg.metadata.tokensUsed} tokens
                    </span>
                    <span className="text-[9px] font-mono text-white/20">·</span>
                    <span className="text-[9px] font-mono text-white/20">
                      {msg.metadata.duration}
                    </span>
                    <span className="text-[9px] font-mono text-white/20">·</span>
                    <span className="text-[9px] font-mono text-white/20">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 resize-none focus:outline-none max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center hover:bg-[#00D4FF]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-white/20 mt-1.5 text-center">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  );
}
