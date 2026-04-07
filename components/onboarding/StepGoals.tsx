'use client'

import { motion } from 'framer-motion'
import { OnboardingData } from '@/lib/onboarding'

interface StepGoalsProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const goalOptions = [
  { id: 'automate_tasks', label: 'Automate repetitive tasks', icon: '🤖' },
  { id: 'scale_operations', label: 'Scale client operations', icon: '📈' },
  { id: 'reduce_followups', label: 'Reduce manual follow-ups', icon: '📉' },
  { id: 'improve_response', label: 'Improve response times', icon: '⚡' },
  { id: 'build_agents', label: 'Build AI agents for my team', icon: '🧠' },
]

export default function StepGoals({ data, updateData }: StepGoalsProps) {
  const toggleGoal = (id: string) => {
    const current = data.goals
    if (current.includes(id)) {
      updateData({ goals: current.filter((g) => g !== id) })
    } else if (current.length < 3) {
      updateData({ goals: [...current, id] })
    }
  }

  const moveGoal = (from: number, to: number) => {
    const updated = [...data.goals]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    updateData({ goals: updated })
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
        <h2 className="text-2xl font-bold text-white mb-2">What are your top 3 goals?</h2>
        <p className="text-gray-400 text-sm">Select up to 3, in order of priority. Click arrows to reorder.</p>
      </div>

      <div className="space-y-3">
        {goalOptions.map((goal, index) => {
          const isSelected = data.goals.includes(goal.id)
          const priorityIndex = data.goals.indexOf(goal.id)
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'bg-cyan-600/10 border-cyan-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-xl">{goal.icon}</span>
              <span className="flex-1 text-sm font-medium">{goal.label}</span>
              {isSelected && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveGoal(priorityIndex, priorityIndex - 1) }}
                    disabled={priorityIndex === 0}
                    className="p-1 disabled:opacity-30 hover:bg-cyan-600/30 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {priorityIndex + 1}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveGoal(priorityIndex, priorityIndex + 1) }}
                    disabled={priorityIndex === data.goals.length - 1}
                    className="p-1 disabled:opacity-30 hover:bg-cyan-600/30 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              )}
            </button>
          )
        })}

        {/* Other goal text input */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Or describe your own goal..."
            value={data.goalOther || ''}
            onChange={(e) => updateData({ goalOther: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
          />
        </div>
      </div>
    </motion.div>
  )
}
