// app/dashboard/page.tsx — ClawOps Studio Dashboard
// Auth: Supabase session (layout handles protection)
export const metadata = { title: 'Dashboard — ClawOps' };
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

interface DemoStats {
  workspaceName: string
  vpsStatus: 'online' | 'offline'
  toolsConnected: number
  agentsActive: number
  lastMissionRun: string
  recentActivity: Array<{ agent: string; action: string; time: string }>
}

function getDemoStats(): DemoStats {
  return {
    workspaceName: 'ClawOps Studio',
    vpsStatus: 'online',
    toolsConnected: 5,
    agentsActive: 3,
    lastMissionRun: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    recentActivity: [
      { agent: 'Ryan', action: 'Sent 20 outreach emails', time: '3 min ago' },
      { agent: 'Arjun', action: 'Completed market research report', time: '15 min ago' },
      { agent: 'Helena', action: 'Resolved 5 support tickets', time: '28 min ago' },
      { agent: 'Ryan', action: 'Qualified 12 leads from LinkedIn', time: '45 min ago' },
      { agent: 'Arjun', action: 'Monitored competitor pricing', time: '1 hr ago' },
    ],
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch { /* ignore in read-only context */ }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch { /* ignore in read-only context */ }
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const isAdmin = user.id === ADMIN_USER_ID
  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'

  const demoStats = isAdmin ? getDemoStats() : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Good {getTimeOfDay()}, {displayName}
          </h1>
          <p className="text-white/40 text-sm mt-1">Here&apos;s your ClawOps workspace</p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatusCard
            label="Workspace"
            value={isAdmin && demoStats ? demoStats.workspaceName : 'Personal'}
            icon="◈"
            badge={isAdmin ? { text: 'Demo', color: 'bg-blue-500/20 text-blue-400' } : undefined}
          />
          <StatusCard
            label="Agents"
            value={isAdmin && demoStats ? `${demoStats.agentsActive} active` : '0 active'}
            icon="◉"
            badge={isAdmin ? { text: 'Online', color: 'bg-emerald-500/20 text-emerald-400' } : undefined}
          />
          <StatusCard
            label="Missions today"
            value={isAdmin && demoStats ? '3' : '0'}
            icon="◇"
            badge={isAdmin && demoStats ? { text: 'Live', color: 'bg-emerald-500/20 text-emerald-400' } : undefined}
          />
        </div>

        {/* VPS Status banner for admin */}
        {isAdmin && demoStats && (
          <div className="flex items-center gap-3 bg-[#111] border border-emerald-500/20 rounded-2xl p-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">VPS: {demoStats.workspaceName} — Online</p>
              <p className="text-white/40 text-xs">{demoStats.toolsConnected} tools connected · Last mission: {Math.round((Date.now() - new Date(demoStats.lastMissionRun).getTime()) / 60000)} min ago</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
              Live
            </span>
          </div>
        )}

        {/* Recent Activity for admin */}
        {isAdmin && demoStats && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {demoStats.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    item.agent === 'Ryan' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.agent === 'Arjun' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.agent[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold ${
                      item.agent === 'Ryan' ? 'text-emerald-400' :
                      item.agent === 'Arjun' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>{item.agent}:</span>{' '}
                    <span className="text-white/60">{item.action}</span>
                  </div>
                  <span className="text-white/30 text-xs shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick setup CTA (shown for non-admin) */}
        {!isAdmin && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-1">Get started with your AI workforce</h2>
            <p className="text-white/40 text-sm mb-4">Complete onboarding to provision your first AI agent</p>
            <a
              href="/start"
              className="inline-flex items-center gap-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Start Setup →
            </a>
          </div>
        )}

        {/* Agent chat placeholder */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">Chat with your agent</h2>
          <div className="bg-black/30 rounded-xl p-6 text-center text-white/20 text-sm border border-white/5">
            Your AI agent workspace will appear here once provisioned.
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({
  label,
  value,
  icon,
  badge,
}: {
  label: string
  value: string
  icon: string
  badge?: { text: string; color: string }
}) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">{label}</span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${badge.color}`}>
              {badge.text}
            </span>
          )}
          <span className="text-white/20 text-xs">{icon}</span>
        </div>
      </div>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  )
}
