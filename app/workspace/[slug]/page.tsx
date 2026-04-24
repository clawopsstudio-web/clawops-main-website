// app/workspace/[slug]/page.tsx
// Served at {slug}.app.clawops.studio via middleware rewrite
// Middleware sets a `workspace_slug` cookie for us to read here

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/dashboard/DashboardShell'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const workspaceSlug = cookieStore.get('workspace_slug')?.value ?? slug

  // Verify this slug belongs to a paid user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch { /* ignore */ }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch { /* ignore */ }
        },
      },
    }
  )

  // Look up workspace by slugified business_name
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('id, business_name, status, dashboard_url')
    .in('status', ['active', 'provisioning', 'paid'])
    .limit(1)

  // Allow the admin demo slug always
  const isAdmin = workspaceSlug === 'demo'

  // Filter for matching slug
  const matched =
    isAdmin ||
    (submission ?? []).some((row: any) => slugify(row.business_name ?? '') === workspaceSlug)

  if (!matched) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Workspace not found</h1>
          <p className="text-white/40 text-sm">
            This workspace doesn&apos;t exist or hasn&apos;t been provisioned yet.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-5 py-2.5 bg-[#e8ff47] text-black font-bold text-sm rounded-xl hover:bg-[#d4eb3a] transition-colors"
          >
            Go to ClawOps Studio →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardShell userSlug={workspaceSlug} />
    </div>
  )
}
