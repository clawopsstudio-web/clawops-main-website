'use client';

import { useState } from 'react';
import { ExternalLink, RefreshCw, Activity, Bot, Cpu, Radio, Zap, Wifi, WifiOff, Server, Clock } from 'lucide-react';

export default function MissionControlPage() {
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const gatewayUrl = typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/gateway/`
    : 'wss://app.clawops.studio/gateway/';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-white/50 mt-0.5">OpenClaw Gateway &amp; Agent Management</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)', boxShadow: '0 0 20px rgba(255,107,53,0.25)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Open Control UI ↗
          </a>
        </div>
      </div>

      {/* Info + Quick Access */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Banner */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'rgba(255,107,53,0.08)', borderColor: 'rgba(255,107,53,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.15)' }}>
                <Activity className="w-5 h-5" style={{ color: '#FF6B35' }} />
              </div>
              <div>
                <h2 className="text-white font-semibold">OpenClaw Control UI</h2>
                <p className="text-white/50 text-sm">Full gateway management interface</p>
              </div>
            </div>
            <p className="text-white/40 text-sm mb-4">
              The Control UI provides complete access to agents, sessions, models, channels, MCP servers,
              workflows, and system configuration. It connects directly to your OpenClaw Gateway.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)', boxShadow: '0 0 20px rgba(255,107,53,0.25)' }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Control UI in new tab ↗
              </a>
              <span className="text-white/30 text-xs">Gateway: <span className="font-mono">{gatewayUrl}</span></span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Bot className="w-5 h-5" />, label: 'Agents', desc: 'Manage AI agents & runs', color: '#FF6B35', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/agents` },
              { icon: <Activity className="w-5 h-5" />, label: 'Sessions', desc: 'View active conversations', color: '#e8ff47', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/sessions` },
              { icon: <Cpu className="w-5 h-5" />, label: 'Models', desc: 'Configure AI model providers', color: '#a855f7', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/models` },
              { icon: <Radio className="w-5 h-5" />, label: 'Channels', desc: 'WhatsApp, Telegram & more', color: '#22c55e', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/channels` },
              { icon: <Zap className="w-5 h-5" />, label: 'Skills', desc: 'Install & manage agent skills', color: '#eab308', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/skills` },
              { icon: <Server className="w-5 h-5" />, label: 'Config', desc: 'Gateway & system settings', color: '#ec4899', href: `/gateway/?gatewayUrl=${encodeURIComponent(gatewayUrl)}#/config` },
            ].map((card) => (
              <a
                key={card.label}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl p-4 border transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${card.color}18` }}
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{card.label}</h3>
                <p className="text-white/40 text-xs">{card.desc}</p>
              </a>
            ))}
          </div>

          {/* Connection Info */}
          <div
            className="rounded-xl p-4 border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Connection Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Gateway URL</span>
                <code className="text-white/60 text-xs font-mono">{gatewayUrl}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Gateway Port</span>
                <span className="text-white/60 text-xs">18789</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Access</span>
                <span className="text-white/60 text-xs">Via Nginx proxy + Cloudflare Tunnel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-sm">Auth Method</span>
                <span className="text-white/60 text-xs">Device Identity (Ed25519)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
