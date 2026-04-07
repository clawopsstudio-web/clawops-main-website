'use client'

import { motion } from 'framer-motion'
import { OnboardingData } from '@/lib/onboarding'

interface StepUseCaseProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const useCases = [
  { id: 'lead_generation', label: 'Lead Generation & Outreach', icon: '🎯' },
  { id: 'support', label: 'Customer Support Automation', icon: '💬' },
  { id: 'sales_pipeline', label: 'Sales Pipeline Management', icon: '📈' },
  { id: 'content', label: 'Content Creation & Social Media', icon: '✍️' },
  { id: 'operations', label: 'Internal Operations', icon: '⚙️' },
  { id: 'analytics', label: 'Reporting & Analytics', icon: '📊' },
  { id: 'multi_client', label: 'Multi-Client Management', icon: '👥' },
]

export default function StepUseCase({ data, updateData }: StepUseCaseProps) {
  const toggleUseCase = (id: string) => {
    const current = data.useCases
    const updated = current.includes(id)
      ? current.filter((uc) => uc !== id)
      : [...current, id]
    updateData({ useCases: updated })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What will you use ClawOps for?</h2>
        <p className="text-gray-400 text-sm">Select all that apply.</p>
      </div>

      <div className="space-y-3">
        {useCases.map((useCase) => {
          const isSelected = data.useCases.includes(useCase.id)
          return (
            <button
              key={useCase.id}
              onClick={() => toggleUseCase(useCase.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'bg-cyan-600/10 border-cyan-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-xl">{useCase.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{useCase.label}</span>
              </div>
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
