'use client'

import { motion } from 'framer-motion'
import { StartFormData, TONES, PLANS } from '@/lib/start-form'

interface Step4IdentityProps {
  data: StartFormData
  updateData: (updates: Partial<StartFormData>) => void
}

export default function Step4Identity({ data, updateData }: Step4IdentityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Name your agent</h2>
        <p className="text-[#666] text-sm">Give your AI agent a name and personality.</p>
      </div>

      {/* Agent Name */}
      <div>
        <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Agent Name *</label>
        <input
          type="text"
          required
          placeholder="e.g. Atlas, Nova, Rex, Zara"
          value={data.agent_name}
          onChange={(e) => updateData({ agent_name: e.target.value })}
          className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#e8ff47] transition-colors text-lg font-medium"
        />
      </div>

      {/* Agent Tone */}
      <div>
        <label className="block text-sm font-medium text-[#f0f0f0] mb-3">Agent Tone *</label>
        <div className="grid grid-cols-2 gap-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => updateData({ agent_tone: tone.id })}
              className={`
                p-4 rounded-xl border text-left transition-all duration-200
                ${data.agent_tone === tone.id
                  ? 'bg-[rgba(232,255,71,0.1)] border-[#e8ff47]'
                  : 'bg-[#111] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                }
              `}
            >
              <div className={`text-sm font-semibold ${data.agent_tone === tone.id ? 'text-[#e8ff47]' : 'text-[#f0f0f0]'}`}>
                {tone.label}
              </div>
              <div className="text-xs text-[#666] mt-1">{tone.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-[#f0f0f0] mb-3">Choose your plan</label>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => updateData({ plan: plan.id })}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200
                ${data.plan === plan.id
                  ? 'bg-[rgba(232,255,71,0.08)] border-[#e8ff47]'
                  : 'bg-[#111] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-sm font-bold ${data.plan === plan.id ? 'text-[#e8ff47]' : 'text-[#f0f0f0]'}`}>
                    {plan.name}
                  </div>
                  <div className="text-xs text-[#666] mt-1">{plan.description}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {plan.features.map((f) => (
                      <span key={f} className="text-[10px] text-[#666] bg-[#1a1a1a] px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className={`text-lg font-bold ${data.plan === plan.id ? 'text-[#e8ff47]' : 'text-[#f0f0f0]'}`}>
                    ${plan.price}
                  </div>
                  <div className="text-xs text-[#666]">/mo</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
