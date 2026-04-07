'use client'

import { motion } from 'framer-motion'
import { OnboardingData } from '@/lib/onboarding'

interface StepIndustryProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const industries = [
  { id: 'agency', label: 'Agency / Consultancy', icon: '🏢' },
  { id: 'ecommerce', label: 'E-commerce / Retail', icon: '🛒' },
  { id: 'saas', label: 'SaaS / Tech Product', icon: '💻' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'fintech', label: 'Finance / Fintech', icon: '💳' },
  { id: 'education', label: 'Education / EdTech', icon: '🎓' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠' },
  { id: 'other', label: 'Other', icon: '✨' },
]

export default function StepIndustry({ data, updateData }: StepIndustryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What's your industry?</h2>
        <p className="text-gray-400 text-sm">This helps us tailor ClawOps for your needs.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {industries.map((industry) => (
          <button
            key={industry.id}
            onClick={() => updateData({ industry: industry.id })}
            className={`
              flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
              ${data.industry === industry.id
                ? 'bg-cyan-600/10 border-cyan-500 text-white'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl">{industry.icon}</span>
            <span className="text-sm font-medium">{industry.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
