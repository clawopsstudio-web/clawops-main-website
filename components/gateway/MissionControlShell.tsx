'use client';

import React, { Component, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOpenClaw } from '@/contexts/OpenClawContext';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  List,
  Cpu,
  Mic,
  Server,
  Zap,
  Radio,
  Clock,
  Settings,
  ScrollText,
  Wifi,
  WifiOff,
  Loader2,
  Plug,
  Shield,
  Key,
  Database,
  Activity,
  Play,
  ChevronRight,
  User,
  Boxes,
  FileText,
  Timer,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/mission-control', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/mission-control/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/mission-control/agents', label: 'Agents', icon: Bot },
  { href: '/dashboard/mission-control/sessions', label: 'Sessions', icon: List },
  { href: '/dashboard/mission-control/models', label: 'Models', icon: Cpu },
  { href: '/dashboard/mission-control/voice', label: 'Voice & STT', icon: Mic },
  { href: '/dashboard/mission-control/nodes', label: 'Nodes', icon: Server },
  { href: '/dashboard/mission-control/mcp', label: 'MCP', icon: Plug },
  { href: '/dashboard/mission-control/skills', label: 'Skills', icon: Zap },
  { href: '/dashboard/mission-control/channels', label: 'Channels', icon: Radio },
  { href: '/dashboard/mission-control/cron', label: 'Cron', icon: Clock },
  { href: '/dashboard/mission-control/config', label: 'Config', icon: Settings },
  { href: '/dashboard/mission-control/logs', label: 'Logs', icon: ScrollText },
  { href: '/dashboard/mission-control/secrets', label: 'Secrets', icon: Key },
  { href: '/dashboard/mission-control/backup', label: 'Backup', icon: Database },
  { href: '/dashboard/mission-control/security', label: 'Security', icon: Shield },
  { href: '/dashboard/mission-control/health', label: 'Health', icon: Activity },
  { href: '/dashboard/mission-control/tasks', label: 'Tasks', icon: Timer },
  { href: '/dashboard/mission-control/devices', label: 'Devices', icon: Boxes },
  { href: '/dashboard/mission-control/memory', label: 'Memory', icon: FileText },
  { href: '/dashboard/mission-control/capability', label: 'Capability', icon: Play },
];

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <p className="text-red-400 text-sm mb-2">Failed to load</p>
            <button onClick={() => this.setState({ hasError: false })} className="text-cyan-400 text-xs hover:underline">
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MissionControlShell({ children }: Props) {
  const pathname = usePathname();
  const { state, isConnected } = useOpenClaw();

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        <aside
          className="w-56 flex-shrink-0 border-r flex flex-col h-full"
          style={{ background: '#0a0a0f', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {/* Logo */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">ClawOps</span>
                <span className="text-[10px] text-cyan-400">Mission Control</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              {state === 'connected' ? (
                <Wifi className="w-3.5 h-3.5 text-green-500" />
              ) : state === 'connecting' || state === 'authenticating' ? (
                <Loader2 className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className="text-[11px] font-medium" style={{
                color: isConnected ? '#22c55e' : state === 'connecting' || state === 'authenticating' ? '#eab308' : '#ef4444',
              }}>
                {state === 'connected' ? 'Gateway Connected' : state === 'connecting' ? 'Connecting...' : state === 'authenticating' ? 'Authenticating...' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-2 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4" />
              Account & Settings
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto" style={{ background: '#06060c' }}>
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
