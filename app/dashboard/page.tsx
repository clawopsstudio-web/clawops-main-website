// app/dashboard/page.tsx — ClawOps Studio Dashboard
// Auth: Supabase session (layout handles protection)
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  // Get user from session via cookies
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

  const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'

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
          <StatusCard label="Plan" value="Personal" icon="◈" />
          <StatusCard label="Agents" value="0 active" icon="◉" />
          <StatusCard label="Missions today" value="0" icon="◇" />
        </div>

        {/* Quick setup CTA */}
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

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function StatusCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">{label}</span>
        <span className="text-white/20 text-xs">{icon}</span>
      </div>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  )
}
