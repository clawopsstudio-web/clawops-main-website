'use client'
import { useState } from 'react'

const TOOLS = [
  { id: 'gmail', name: 'Gmail', desc: 'Email client', connected: false },
  { id: 'slack', name: 'Slack', desc: 'Team messaging', connected: false },
  { id: 'notion', name: 'Notion', desc: 'Notes & docs', connected: false },
  { id: 'github', name: 'GitHub', desc: 'Code repos', connected: false },
  { id: 'gcalendar', name: 'Google Calendar', desc: 'Calendar', connected: false },
  { id: 'gsheets', name: 'Google Sheets', desc: 'Spreadsheets', connected: false },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Messaging', connected: false },
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM', connected: false },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Social', connected: false },
  { id: 'gdrive', name: 'Google Drive', desc: 'File storage', connected: false },
  { id: 'telegram_own', name: 'Telegram Bot', desc: 'Your bot token', connected: false },
  { id: 'discord', name: 'Discord', desc: 'Webhooks', connected: false },
]

export default function ToolsPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [botToken, setBotToken] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-white font-black text-lg">Tools</h1>
        <p className="text-white/30 text-xs mt-1">Connect your apps. Agents use these to work on your behalf.</p>
      </div>

      {/* App grid */}
      <div className="grid grid-cols-4 gap-3">
        {TOOLS.map(t => (
          <div key={t.id} className="bg-[#111] border border-white/7 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center text-white/60 text-xs font-bold">{t.name[0]}</div>
              <div className={`w-2 h-2 rounded-full ${t.connected ? 'bg-emerald-400' : 'bg-white/20'}`} />
            </div>
            <p className="text-white font-semibold text-xs">{t.name}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{t.desc}</p>
            <button
              onClick={() => setConnecting(t.id)}
              className={`mt-3 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                t.connected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  : 'bg-white/8 hover:bg-white/12 text-white/60 border border-white/10'
              }`}
            >
              {t.connected ? 'Manage' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      {/* Messaging tokens */}
      <div>
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Messaging Tokens</h2>
        <div className="bg-[#111] border border-white/7 rounded-xl divide-y divide-white/5">
          {[
            { label: 'Telegram Bot Token', key: 'user_telegram_bot_token', placeholder: 'Your bot token from @BotFather' },
            { label: 'WhatsApp Number', key: 'user_whatsapp_number', placeholder: '+91XXXXXXXXXX' },
            { label: 'Slack Webhook URL', key: 'user_slack_webhook_url', placeholder: 'https://hooks.slack.com/...' },
            { label: 'Discord Webhook URL', key: 'user_discord_webhook_url', placeholder: 'https://discord.com/api/webhooks/...' },
          ].map(f => (
            <div key={f.key} className="p-4 flex items-center gap-4">
              <div className="w-36 shrink-0">
                <p className="text-white/60 text-xs">{f.label}</p>
              </div>
              <input
                type="text"
                placeholder={f.placeholder}
                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => setSaved(true)}
                className="px-4 py-2 bg-white/8 hover:bg-white/12 text-white/80 text-xs rounded-lg shrink-0"
              >
                Save
              </button>
              {saved && <span className="text-emerald-400 text-xs shrink-0">Saved</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
