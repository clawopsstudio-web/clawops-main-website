'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import StepIndicator from '@/components/onboarding/start/StepIndicator'
import Step1Profile from '@/components/onboarding/start/Step1Profile'
import Step2Goals from '@/components/onboarding/start/Step2Goals'
import Step3Tools from '@/components/onboarding/start/Step3Tools'
import Step4Identity from '@/components/onboarding/start/Step4Identity'
import Step5Confirm from '@/components/onboarding/start/Step5Confirm'
import { StartFormData, defaultFormData, STEPS } from '@/lib/start-form'

export default function StartForm() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<StartFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const updateData = (updates: Partial<StartFormData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    if (step === 1) return data.full_name && data.business_name && data.industry && data.business_description
    if (step === 2) return data.goals.length > 0
    if (step === 3) return true // tools optional
    if (step === 4) return data.agent_name && data.plan
    return true
  }

  const handleNext = () => {
    if (!canProceed()) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStep(s => Math.min(s + 1, 5))
  }

  const handleBack = () => {
    setError('')
    setStep(s => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/start/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Submission failed')
      }
      // TODO: Replace with Stripe redirect
      // router.push(`/start/success?id=${result.id}`)
      router.push(`/start/success?id=${result.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const stepProps = { data, updateData }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <div className="border-b border-[rgba(255,255,255,0.05)] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-tight">
            Claw<span className="text-[#e8ff47]">Ops</span>
          </a>
          <span className="text-xs text-[#666]">Step {step} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-px bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full bg-[#e8ff47] transition-all duration-500 ease-out"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {step === 1 && <Step1Profile {...stepProps} />}
              {step === 2 && <Step2Goals {...stepProps} />}
              {step === 3 && <Step3Tools {...stepProps} />}
              {step === 4 && <Step4Identity {...stepProps} />}
              {step === 5 && (
                <Step5Confirm
                  data={data}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)]">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="text-sm text-[#666] hover:text-[#f0f0f0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-8 py-3 rounded-xl transition-colors"
              >
                {step === 4 ? 'Review →' : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
