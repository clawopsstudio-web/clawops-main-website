'use client';

/**
 * Mission Control / Terminal Page
 * Terminal access via Hermes
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Terminal as TerminalIcon, Play, Square, Trash2, RefreshCw } from 'lucide-react';

interface TerminalSession {
  id: string;
  name: string;
  created_at: string;
}

export default function TerminalPage() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const loadSessions = async () => {
    // TODO: Load from Hermes terminal sessions
    setSessions([
      { id: 'main', name: 'Main Terminal', created_at: new Date().toISOString() },
    ]);
    setActiveSession('main');
    setOutput(['Welcome to Mission Control Terminal', 'Type commands to interact with your VPS...', '']);
  };

  const createSession = async () => {
    const newSession: TerminalSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      created_at: new Date().toISOString(),
    };
    setSessions([...sessions, newSession]);
    setActiveSession(newSession.id);
    setOutput([]);
  };

  const closeSession = async (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (activeSession === sessionId) {
      setActiveSession(newSessions[0]?.id || null);
    }
  };

  const sendCommand = async () => {
    if (!input.trim() || loading) return;

    const cmd = input.trim();
    setInput('');
    setLoading(true);

    // Add to output
    setOutput(prev => [...prev, `$ ${cmd}`]);

    // Add to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    try {
      // TODO: Call Hermes terminal API
      // For demo, simulate response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (cmd === 'clear') {
        setOutput([]);
      } else if (cmd === 'help') {
        setOutput(prev => [...prev, 
          'Available commands:',
          '  help     - Show this help',
          '  clear    - Clear terminal',
          '  status   - Show VPS status',
          '  agents   - List active agents',
          '  logs     - Show recent logs',
          ''
        ]);
      } else if (cmd === 'status') {
        setOutput(prev => [...prev, 
          'VPS Status: Online',
          'Hermes: Running v0.12.0',
          'Memory: 1.2GB / 4GB',
          'CPU: 12%',
          ''
        ]);
      } else if (cmd === 'agents') {
        setOutput(prev => [...prev, 
          'Active Agents:',
          '  Ryan     - Sales Agent      - Active',
          '  Arjun    - Research Agent    - Active',
          '  Tyler    - Marketing Agent   - Idle',
          ''
        ]);
      } else if (cmd === 'logs') {
        setOutput(prev => [...prev, 
          'Recent Activity:',
          '  12:30 - Ryan: Completed lead research',
          '  12:25 - Arjun: Updated competitor analysis',
          '  12:20 - Tyler: Posted to social media',
          ''
        ]);
      } else {
        setOutput(prev => [...prev, `Command not found: ${cmd}`, '']);
      }
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error}`, '']);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="h-full flex bg-gray-950">
      {/* Sidebar */}
      <div className="w-48 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessions</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                activeSession === session.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => setActiveSession(session.id)}
            >
              <div className="flex items-center gap-2">
                <TerminalIcon size={14} />
                <span className="text-sm truncate">{session.name}</span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(session.id);
                  }}
                  className="text-gray-600 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-gray-800">
          <button
            onClick={createSession}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex items-center justify-center gap-2"
          >
            <PlusIcon size={14} />
            New Session
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm text-gray-400 ml-2">Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOutput([])}
              className="p-1.5 hover:bg-gray-800 rounded text-gray-500"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={loadSessions}
              className="p-1.5 hover:bg-gray-800 rounded text-gray-500"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Output */}
        <div
          ref={outputRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-gray-950"
        >
          {output.map((line, i) => (
            <div
              key={i}
              className={`${
                line.startsWith('$') ? 'text-green-400' : 'text-gray-300'
              }`}
            >
              {line || '\u00A0'}
            </div>
          ))}
          {loading && (
            <div className="text-blue-400 animate-pulse">Executing...</div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center p-4 bg-gray-900 border-t border-gray-800">
          <span className="text-green-400 font-mono mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-gray-100 font-mono text-sm focus:outline-none"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={sendCommand}
            disabled={loading || !input.trim()}
            className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
