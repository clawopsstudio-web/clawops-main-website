'use client';

import { useState, useRef, useEffect } from 'react';
import { useOpenClaw } from '@/contexts/OpenClawContext';
import { Send, Bot, Loader2, User, Trash2, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { isConnected, rpc } = useOpenClaw();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !isConnected) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result: any = await (rpc as any)('agent', {
        prompt: userMsg.content,
        model: 'auto',
      });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
      }]);
    }
    setLoading(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-bold text-white">AI Chat</h1>
        <p className="text-xs text-white/50">Chat with your AI agents via the gateway</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-12 h-12 text-white/10 mb-3" />
            <p className="text-white/40 text-sm">Send a message to start chatting</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-500' : 'bg-purple-500'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[70%] space-y-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-cyan-500/10 text-cyan-300 rounded-tr-md' : 'bg-white/5 text-white/80 rounded-tl-md'}`}>
                <pre className="whitespace-pre-wrap font-sans text-xs">{msg.content}</pre>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30">{msg.timestamp.toLocaleTimeString()}</span>
                <button onClick={() => copyMessage(msg.id, msg.content)} className="text-white/20 hover:text-white/50 transition-colors">
                  {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-md bg-white/5">
              <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isConnected ? 'Type your message...' : 'Gateway not connected...'}
            disabled={!isConnected || loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected || loading}
            className="px-4 py-3 rounded-xl bg-cyan-500 text-white disabled:opacity-30 hover:bg-cyan-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="px-3 py-3 rounded-xl text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
