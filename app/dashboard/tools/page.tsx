'use client'
import { useState, useEffect } from 'react'
export const metadata = { title: 'Tools — ClawOps' };
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const FEATURED_TOOLS = [
  { id: 'gmail', name: 'Gmail', category: 'Email', connected: false, color: '#EA4335', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  )},
  { id: 'slack', name: 'Slack', category: 'Messaging', connected: false, color: '#4A154B', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.52 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.124a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.522zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>
  )},
  { id: 'telegram', name: 'Telegram', category: 'Messaging', connected: false, color: '#26A5E4', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  )},
  { id: 'notion', name: 'Notion', category: 'Docs', connected: false, color: '#FFFFFF', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.025c-.42-.326-.98-.7-2.055-.607L3.01 2.526c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.046-.747.326-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.494-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.135c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>
  )},
  { id: 'gsheets', name: 'Google Sheets', category: 'Spreadsheets', connected: false, color: '#34A853', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M14.727 6.727h5.273v10.546H14.727zm-.818 1.636h2.727v3.273h-2.727zm0 4.909h2.727v3.273h-2.727zM6.182 6.727h5.091v1.636H7v2.727h3.455v1.636H7v2.727h4.273v1.636H6.182zM3.273 6.727h2.182v1.636H3.273zm0 2.455h2.182v1.636H3.273zm0 2.455h2.182v1.636H3.273zm0 2.455h2.182v1.636H3.273zm0 2.455h2.182v1.636H3.273z"/></svg>
  )},
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', connected: false, color: '#FF7A59', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.164 7.931V5.084a2.004 2.004 0 0 0 1.175-1.84 2.004 2.004 0 0 0-1.175-1.84A2.004 2.004 0 0 0 16.73.016 2.004 2.004 0 0 0 15.555 1.84a2.004 2.004 0 0 0-1.175 1.84 2.004 2.004 0 0 0 1.175 1.84v2.847c-.612.063-1.205.196-1.77.397v-3.17a2.28 2.28 0 0 0 1.315-2.077 2.28 2.28 0 0 0-1.315-2.077A2.28 2.28 0 0 0 12.05 2.7a2.28 2.28 0 0 0-1.315 2.077 2.28 2.28 0 0 0 1.315 2.077v3.17a8.29 8.29 0 0 0-2.39.898V5.084a2.004 2.004 0 0 0 1.175-1.84 2.004 2.004 0 0 0-1.175-1.84A2.004 2.004 0 0 0 8.225.016a2.004 2.004 0 0 0-1.175 1.84 2.004 2.004 0 0 0 1.175 1.84v2.847a8.29 8.29 0 0 0-2.39.898V5.084a2.004 2.004 0 0 0 1.175-1.84A2.004 2.004 0 0 0 5.575.016a2.004 2.004 0 0 0-1.175 1.84 2.004 2.004 0 0 0 1.175 1.84v4.847c0 4.002 2.43 7.502 5.925 8.955a8.17 8.17 0 0 0 2.39.898v-4.847a2.004 2.004 0 0 0-1.175-1.84 2.004 2.004 0 0 0 1.175-1.84 2.004 2.004 0 0 0-1.175-1.84A2.004 2.004 0 0 0 13.725.016a2.004 2.004 0 0 0-1.175 1.84 2.004 2.004 0 0 0 1.175 1.84v4.847a8.17 8.17 0 0 0 2.39-.898 8.955 8.955 0 0 0 2.05-5.79V7.931z"/></svg>
  )},
  { id: 'whatsapp', name: 'WhatsApp', category: 'Messaging', connected: false, color: '#25D366', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  )},
  { id: 'intercom', name: 'Intercom', category: 'Support', connected: false, color: '#1F8DED', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M21.527 2.473a2.444 2.444 0 0 0-2.236.06L2.474 13.04A2.32 2.32 0 0 0 2 14.767V22a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7.233a2.32 2.32 0 0 0-.474-1.727l-3.817-5.334zM12 18.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
  )},
  { id: 'github', name: 'GitHub', category: 'Development', connected: false, color: '#FFFFFF', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
  )},
  { id: 'airtable', name: 'Airtable', category: 'Database', connected: false, color: '#18BFFF', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M14.302 8.866l-2.47 1.43-1.593-2.69 2.47-1.43zM2 18.5V5.5l5 3.5v9.5zM22 5.5l-5 3.5 5 3.5 5-3.5zM9.5 14.77l-1.47.85-2.69-4.545 1.47-.85zm6.93-4.62l-1.47.85-1.47-.85 1.47-.85zm-3.465 0l-1.47.85-1.47-.85 1.47-.85zm0 3.08l-1.47.85-1.47-.85 1.47-.85zm0 3.08l-1.47.85-1.47-.85 1.47-.85z"/></svg>
  )},
  { id: 'linear', name: 'Linear', category: 'Project Management', connected: false, color: '#5E6AD2', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M2.654 10.6a.463.463 0 0 1-.004-.65l8.9-8.9a.463.463 0 0 1 .65.004c3.59 3.59 9.4 3.59 12.99 0s3.59-9.4 0-12.99a.463.463 0 0 1-.65-.004l-8.9 8.9a.463.463 0 0 1-.65-.004C6.82 1.22 1.22 6.82 2.654 10.6zm3.12-3.12a.463.463 0 0 1 0-.65l6.24-6.24a.463.463 0 0 1 .65 0c1.42 1.42 3.72 1.42 5.14 0s1.42-3.72 0-5.14a.463.463 0 0 1 0-.65l.65.65-7.18 7.18-.65-.65z"/></svg>
  )},
  { id: 'stripe', name: 'Stripe', category: 'Payments', connected: false, color: '#635BFF', icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>
  )},
]

export default function ToolsPage() {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [botToken, setBotToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  const isAdmin = userId === ADMIN_USER_ID
  const tools = isAdmin
    ? FEATURED_TOOLS.map(t => ({ ...t, connected: ['gmail', 'telegram', 'notion', 'github', 'hubspot'].includes(t.id) }))
    : FEATURED_TOOLS.map(t => ({ ...t, connected: false }))

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-white font-black text-lg">Tools</h1>
        <p className="text-white/30 text-xs mt-1">Connect your apps. Agents use these to work on your behalf.</p>
      </div>

      {/* Featured section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Featured</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#e8ff47]/10 text-[#e8ff47] font-medium">{tools.filter(t => t.connected).length} connected</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {tools.map(t => (
            <div key={t.id} className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${t.color}18`, color: t.color }}>
                  {t.icon}
                </div>
                <div className={`w-2 h-2 rounded-full ${t.connected ? 'bg-emerald-400' : 'bg-white/20'}`} />
              </div>
              <p className="text-white font-semibold text-xs">{t.name}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{t.category}</p>
              {t.connected && (
                <div className="mt-2.5 text-[10px] px-2 py-1 rounded-lg text-center font-medium bg-emerald-950 text-emerald-400 border border-emerald-900">
                  Connected
                </div>
              )}
              {!t.connected && (
                <button
                  onClick={() => {
                    setConnecting(t.id)
                    setTimeout(() => {
                      setConnecting(null)
                      alert(`${t.name} integration — Coming Soon`)
                    }, 800)
                  }}
                  className="mt-1.5 w-full py-1.5 rounded-lg text-[11px] font-semibold bg-white/8 hover:bg-white/12 text-white/60 border border-white/10 transition-colors"
                >
                  {connecting === t.id ? '...' : 'Connect'}
                </button>
              )}
            </div>
          ))}
        </div>
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
