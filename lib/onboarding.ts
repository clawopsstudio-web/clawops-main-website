import { supabase } from '@/lib/supabase/client'

export interface OnboardingData {
  name: string
  company: string
  role: string
  industry: string
  useCases: string[]
  integrations: string[]
  goals: string[]
  goalOther?: string
}

export interface OnboardingStep {
  id: number
  title: string
  description: string
}

export const onboardingSteps: OnboardingStep[] = [
  { id: 1, title: 'Profile', description: 'Tell us about yourself' },
  { id: 2, title: 'Industry', description: 'What industry are you in?' },
  { id: 3, title: 'Use Case', description: 'How will you use ClawOps?' },
  { id: 4, title: 'Integrations', description: 'Connect your existing tools' },
  { id: 5, title: 'Goals', description: 'What do you want to achieve?' },
  { id: 6, title: 'Complete', description: "You're all set!" },
]

export async function saveOnboardingData(data: OnboardingData): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const payload = {
    user_id: user.id,
    name: data.name,
    company: data.company,
    role: data.role,
    industry: data.industry,
    use_cases: data.useCases,
    integrations: data.integrations,
    goals: data.goals,
    goal_other: data.goalOther || null,
    completed: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('onboarding_configs')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to save onboarding data:', error)
    return false
  }

  return true
}

export async function getOnboardingStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('onboarding_configs')
    .select('completed')
    .eq('user_id', userId)
    .single()

  if (error || !data) return false
  return data.completed === true
}
