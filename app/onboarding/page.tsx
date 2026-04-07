'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  StepProfile,
  StepIndustry,
  StepUseCase,
  StepIntegrations,
  StepGoals,
  StepComplete,
  StepIndicator,
} from '@/components/onboarding'
import { OnboardingData, getOnboardingStatus } from '@/lib/onboarding'
import ParticleConstellation from '@/components/ui/ParticleConstellation'

const TOTAL_STEPS = 6

const initialData: OnboardingData = {
  name: '',
  company: '',
  role: '',
  industry: '',
  useCases: [],
  integrations: [],
  goals: [],
  goalOther: '',
}

function validateStep(step: number, data: OnboardingData): boolean {
  switch (step) {
    case 1:
      return !!(data.name.trim() && data.company.trim() && data.role)
    case 2:
      return !!data.industry
    case 3:
      return data.useCases.length > 0
    case 4:
      return true // integrations are optional
    case 5:
      return data.goals.length > 0 || !!data.goalOther?.trim()
    case 6:
      return true
    default:
      return false
  }
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      const completed = await getOnboardingStatus(user.id)
      if (completed) {
        router.replace('/dashboard')
        return
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (validateStep(step, data)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }
  }

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleComplete = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#04040c] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <ParticleConstellation />
      </div>
      <div className="fixed inset-0 bg-gradient-radial from-cyan-500/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Logo / Brand */}
      <div className="fixed top-6 left-6 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ClawOps</span>
        </div>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-20">
        <motion.div
          className="w-full max-w-xl bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>

          {/* Step Content */}
          <div className="min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {step === 1 && <StepProfile data={data} updateData={updateData} />}
                {step === 2 && <StepIndustry data={data} updateData={updateData} />}
                {step === 3 && <StepUseCase data={data} updateData={updateData} />}
                {step === 4 && <StepIntegrations data={data} updateData={updateData} />}
                {step === 5 && <StepGoals data={data} updateData={updateData} />}
                {step === 6 && <StepComplete data={data} onComplete={handleComplete} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!validateStep(step, data)}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
              >
                {step === 5 ? 'Finish Setup' : 'Continue'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
