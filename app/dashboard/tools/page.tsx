'use client'
import { useState, useEffect } from 'react'
export const metadata = { title: 'Tools — ClawOps' }
import { createClient } from '@/lib/supabase/client'

const ADMIN_UID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

export default function ToolsPage() {
  const [userId, setUserId] = useState('')
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  const isAdmin = userId === ADMIN_UID

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-white font-black text-lg">Tools</h1>
        <p className="text-white/30 text-xs mt-1">Connect your apps. Agents use these to work on your behalf.</p>
      </div>

      {/* Featured integrations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Featured</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: 'Gmail', cat: 'Email' },
            { name: 'Telegram', cat: 'Messaging' },
            { name: 'Slack', cat: 'Messaging' },
            { name: 'Notion', cat: 'Docs' },
            { name: 'HubSpot', cat: 'CRM' },
            { name: 'GitHub', cat: 'Dev' },
            { name: 'Stripe', cat: 'Payments' },
            { name: 'Linear', cat: 'Project Management' },
          ].map(tool => (
            <div key={tool.name} className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center mb-3">
                <div className="text-white/60 text-sm font-bold">{tool.name[0]}</div>
              </div>
              <p className="text-white font-semibold text-xs">{tool.name}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{tool.cat}</p>
              <div className="mt-2 text-[10px] px-2 py-1 rounded-lg text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Messaging Channels */}
      <div>
        <h2 className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Connect Messaging Channels</h2>
        <div className="space-y-3">
          {[
            { name: 'Telegram', desc: 'Agents send Telegram messages and alerts', how: 'Message @BotFather on Telegram → /newbot → copy token', color: '#26A5E4' },
            { name: 'WhatsApp', desc: 'Receive WhatsApp notifications and alerts', how: 'Get WhatsApp Business API key from Meta for Developers', color: '#25D366' },
            { name: 'Slack', desc: 'Post team updates and alerts to Slack channels', how: 'Create Incoming Webhook in your Slack workspace settings', color: '#4A154B' },
            { name: 'Discord', desc: 'Send alerts to Discord channels', how: 'Add webhook in Discord channel settings', color: '#5865F2' },
          ].map(ch => (
            <div key={ch.name} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: ch.color + '22', color: ch.color }}>
                  {ch.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{ch.name}</p>
                  <p className="text-white/30 text-xs">{ch.desc}</p>
                </div>
                <div className="ml-auto">
                  <input
                    type="text"
                    placeholder="Paste key here..."
                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 text-white/50 text-xs w-48 focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
              <p className="text-white/20 text-[10px]">How to get it → {ch.how}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
