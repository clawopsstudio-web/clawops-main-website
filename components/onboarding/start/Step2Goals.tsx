'use client'

import { motion } from 'framer-motion'
import { StartFormData, GOALS } from '@/lib/start-form'

interface Step2GoalsProps {
  data: StartFormData
  updateData: (updates: Partial<StartFormData>) => void
}

export default function Step2Goals({ data, updateData }: Step2GoalsProps) {
  const toggleGoal = (id: string) => {
    if (id === 'all_of_above') {
      // Toggle all_of_above independently
      if (data.goals.includes('all_of_above')) {
        updateData({ goals: [] })
      } else {
        updateData({ goals: ['all_of_above'] })
      }
      return
    }
    // Remove all_of_above if selecting individual goals
    const current = data.goals.filter(g => g !== 'all_of_above')
    if (current.includes(id)) {
      updateData({ goals: current.filter(g => g !== id) })
    } else {
      updateData({ goals: [...current, id] })
    }
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
        <h2 className="text-2xl font-bold text-white mb-1">What should your agent do?</h2>
        <p className="text-[#666] text-sm">Select all that apply. You can change this later.</p>
      </div>

      <div className="space-y-3">
        {GOALS.map((goal) => {
          const isSelected = data.goals.includes(goal.id)
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'bg-[rgba(232,255,71,0.1)] border-[#e8ff47] text-white'
                  : 'bg-[#111] border-[rgba(255,255,255,0.07)] text-[#666] hover:border-[rgba(255,255,255,0.15)] hover:text-[#f0f0f0]'
                }
              `}
            >
              <span className="text-xl w-8 text-center">{goal.icon}</span>
              <span className="flex-1 text-sm font-medium">{goal.label}</span>
              <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-colors
                ${isSelected ? 'bg-[#e8ff47] border-[#e8ff47]' : 'border-[rgba(255,255,255,0.15)]'}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
