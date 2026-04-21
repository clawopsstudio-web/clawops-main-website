'use client'

import { STEPS } from '@/lib/start-form'

interface StepIndicatorProps {
  current: number
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = i + 1 < current
        const isCurrent = i + 1 === current
        const isLast = i === STEPS.length - 1

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isCompleted ? 'bg-[#e8ff47] text-black' : isCurrent ? 'bg-[#e8ff47] text-black ring-4 ring-[rgba(232,255,71,0.2)]' : 'bg-[#1a1a1a] text-[#666] border border-[#1a1a1a]'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
            </div>
            {!isLast && (
              <div className={`w-8 h-px mb-5 mx-1 transition-colors duration-300 ${isCompleted ? 'bg-[#e8ff47]' : 'bg-[#1a1a1a]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
