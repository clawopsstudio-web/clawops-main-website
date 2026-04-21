'use client'

import { motion } from 'framer-motion'
import { OnboardingData, saveOnboardingData } from '@/lib/onboarding'
import { useState } from 'react'

interface StepCompleteProps {
  data: OnboardingData
  onComplete: () => void
}

const industryLabels: Record<string, string> = {
  agency: 'Agency / Consultancy',
  ecommerce: 'E-commerce / Retail',
  saas: 'SaaS / Tech Product',
  healthcare: 'Healthcare',
  fintech: 'Finance / Fintech',
  education: 'Education / EdTech',
  realestate: 'Real Estate',
  other: 'Other',
}

const useCaseLabels: Record<string, string> = {
  lead_generation: 'Lead Generation & Outreach',
  support: 'Customer Support Automation',
  sales_pipeline: 'Sales Pipeline Management',
  content: 'Content Creation & Social Media',
  operations: 'Internal Operations',
  analytics: 'Reporting & Analytics',
  multi_client: 'Multi-Client Management',
}

const goalLabels: Record<string, string> = {
  automate_tasks: 'Automate repetitive tasks',
  scale_operations: 'Scale client operations',
  reduce_followups: 'Reduce manual follow-ups',
  improve_response: 'Improve response times',
  build_agents: 'Build AI agents for my team',
}

const integrationIcons: Record<string, string> = {
  ghl: '🔗', hubspot: '🟠', salesforce: '☁️',
  zapier: '⚡', airtable: '📊', notion: '📓',
  slack: '💬', gmail: '📧',
}

export default function StepComplete({ data, onComplete }: StepCompleteProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async () => {
    setSaving(true)
    setError(null)
    const success = await saveOnboardingData(data)
    if (success) {
      onComplete()
    } else {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">You're all set!</h2>
        <p className="text-gray-400 text-sm">Here's what we configured for you.</p>
      </div>

      <div className="space-y-3">
        {data.name && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Profile</p>
            <p className="text-white font-medium">{data.name}</p>
            <p className="text-gray-400 text-sm">{data.company} · {data.role}</p>
          </div>
        )}

        {data.industry && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Industry</p>
            <p className="text-white font-medium">{industryLabels[data.industry] || data.industry}</p>
          </div>
        )}

        {data.useCases.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Use Cases</p>
            <div className="flex flex-wrap gap-2">
              {data.useCases.map((uc) => (
                <span key={uc} className="px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs">
                  {useCaseLabels[uc] || uc}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.integrations.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Integrations</p>
            <div className="flex flex-wrap gap-2">
              {data.integrations.map((i) => (
                <span key={i} className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-gray-300 text-xs">
                  {integrationIcons[i] || ''} {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.goals.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Top Goals</p>
            <div className="space-y-1">
              {data.goals.map((g, i) => (
                <p key={g} className="text-white text-sm">
                  <span className="text-cyan-400 font-bold mr-2">{i + 1}.</span>
                  {goalLabels[g] || g}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleFinish}
        disabled={saving}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
      >
        {saving ? 'Setting up...' : 'Go to Dashboard'}
      </button>
    </motion.div>
  )
}
