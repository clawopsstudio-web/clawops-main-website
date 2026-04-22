'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

const USE_CASES = [
  { id: 'sales', label: 'Sales Outreach' },
  { id: 'support', label: 'Customer Support' },
  { id: 'research', label: 'Research & Analysis' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'ops', label: 'Operations' },
  { id: 'all', label: 'All of the above' },
]

const LOADING_STEPS = [
  'Connecting AI runtime...',
  'Setting up workspace...',
  'Launching your agents...',
  'Almost there...',
]

function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [workspace, setWorkspace] = useState('')
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')

  // Check auth + already-onboarded status
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login?redirect=/onboarding')
        return
      }
      const { data: row } = await supabase
        .from('onboarding_submissions')
        .select('status')
        .eq('clerk_user_id', user.id)
        .eq('status', 'active')
        .single()
      if (row) {
        router.replace('/dashboard')
      }
    }
    check()
  }, [router, supabase])

  const toggle = (id: string) => {
    setSelectedCases(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleLaunch = async () => {
    if (!workspace.trim()) return
    setLoading(true)
    setStep(3) // loading screen

    // Cycle loading steps
    let ls = 0
    const interval = setInterval(() => {
      ls = (ls + 1) % LOADING_STEPS.length
      setLoadingStep(ls)
    }, 800)

    try {
      const { data: { user } = {} } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: dbErr } = await supabase
        .from('onboarding_submissions')
        .upsert({
          clerk_user_id: user.id,
          full_name: (user as any)?.full_name ?? user.email?.split('@')[0] ?? 'User',
          business_name: workspace.trim(),
          industry: selectedCases.join(', ') || 'General',
          plan: 'personal',
          status: 'active',
          payment_status: 'paid',
          agent_name: workspace.trim(),
        }, { onConflict: 'clerk_user_id' })

      if (dbErr) throw dbErr
      clearInterval(interval)
      router.push('/dashboard')
    } catch (e: any) {
      clearInterval(interval)
      setError(e.message ?? 'Something went wrong')
      setStep(2)
      setLoading(false)
    }
  }

  // Loading screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e8ff47] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-black text-2xl">C</span>
          </div>
          <p className="text-white font-bold text-lg mb-2">Setting up your workspace...</p>
          <p className="text-white/40 text-sm animate-pulse">{LOADING_STEPS[loadingStep]}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#e8ff47] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-black text-lg">C</span>
          </div>
          <h1 className="text-white font-black text-2xl">ClawOps Studio</h1>
          <p className="text-white/40 text-sm mt-1">Step {step} of 2</p>
        </div>

        {/* Step 1: Workspace name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold text-sm mb-2">
                What should we call your workspace?
              </label>
              <input
                autoFocus
                value={workspace}
                onChange={e => setWorkspace(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && workspace.trim()) setStep(2)
                }}
                placeholder="Acme Corp"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e8ff47] transition-colors"
              />
            </div>
            {workspace.trim() && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold rounded-xl transition-colors text-sm"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Use cases */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold text-sm mb-3">
                What will your agents handle?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USE_CASES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                      selectedCases.includes(c.id)
                        ? 'border-[#e8ff47] bg-[#e8ff47]/10 text-white'
                        : 'border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleLaunch}
              disabled={!workspace.trim() || loading}
              className="w-full py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
            >
              {loading ? 'Launching...' : 'Launch My OS →'}
            </button>
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingPage
