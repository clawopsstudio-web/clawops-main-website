'use client'

import { motion } from 'framer-motion'
import { OnboardingData } from '@/lib/onboarding'

interface StepProfileProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const roles = ['Founder', 'CEO', 'CTO', 'Developer', 'Marketer', 'Sales', 'Operations', 'Other']

export default function StepProfile({ data, updateData }: StepProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Create your profile</h2>
        <p className="text-gray-400 text-sm">Let's start with the basics.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
          <input
            type="text"
            placeholder="Acme Inc."
            value={data.company}
            onChange={(e) => updateData({ company: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Role</label>
          <select
            value={data.role}
            onChange={(e) => updateData({ role: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled className="text-gray-500">Select your role</option>
            {roles.map((role) => (
              <option key={role} value={role} className="bg-gray-800">
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  )
}
