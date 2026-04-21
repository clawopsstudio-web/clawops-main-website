'use client'

import { motion } from 'framer-motion'
import { StartFormData, INDUSTRIES } from '@/lib/start-form'

interface Step1ProfileProps {
  data: StartFormData
  updateData: (updates: Partial<StartFormData>) => void
}

export default function Step1Profile({ data, updateData }: Step1ProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Create your OS profile</h2>
        <p className="text-[#666] text-sm">This helps your agent understand your business.</p>
      </div>

      <div className="space-y-4">
        {/* Full Name + Business Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Your Name *</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={data.full_name}
              onChange={(e) => updateData({ full_name: e.target.value })}
              className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#e8ff47] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Business Name *</label>
            <input
              type="text"
              required
              placeholder="Acme Inc."
              value={data.business_name}
              onChange={(e) => updateData({ business_name: e.target.value })}
              className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#e8ff47] transition-colors"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Website URL <span className="text-[#666]">(optional)</span></label>
          <input
            type="url"
            placeholder="https://yourbusiness.com"
            value={data.website_url}
            onChange={(e) => updateData({ website_url: e.target.value })}
            className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#e8ff47] transition-colors"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-[#f0f0f0] mb-2">Industry *</label>
          <div className="grid grid-cols-3 gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => updateData({ industry: ind.id })}
                className={`
                  p-3 rounded-xl border text-sm font-medium text-center transition-all duration-200
                  ${data.industry === ind.id
                    ? 'bg-[rgba(232,255,71,0.1)] border-[#e8ff47] text-[#e8ff47]'
                    : 'bg-[#111] border-[rgba(255,255,255,0.07)] text-[#666] hover:border-[rgba(255,255,255,0.15)] hover:text-[#f0f0f0]'
                  }
                `}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business Description */}
        <div>
          <label className="block text-sm font-medium text-[#f0f0f0] mb-2">What do you do? *</label>
          <textarea
            required
            rows={3}
            placeholder="Describe what you do and who you serve in 2–3 sentences. Your agent will use this to introduce itself and understand your context."
            value={data.business_description}
            onChange={(e) => updateData({ business_description: e.target.value })}
            className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#666] focus:outline-none focus:border-[#e8ff47] transition-colors resize-none text-sm leading-relaxed"
          />
        </div>
      </div>
    </motion.div>
  )
}
