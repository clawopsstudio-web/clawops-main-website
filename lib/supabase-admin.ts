/**
 * supabase-admin.ts — Server-side Supabase client with service role permissions.
 * Bypasses RLS. Use ONLY in secure API routes, never in client code.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
  )
}

/** Service-role client — bypasses RLS, full database access */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ─── Onboarding submission helpers ────────────────────────────────────────

export type OnboardingStatus =
  | 'pending_payment'
  | 'paid'
  | 'provisioning'
  | 'active'
  | 'abandoned'
  | 'suspended'

export interface OnboardingRow {
  id: string
  clerk_user_id: string | null
  status: OnboardingStatus
  plan: string | null
  full_name: string | null
  business_name: string | null
  email: string | null
  agent_name: string | null
  paid_at: string | null
  provisioned_at: string | null
  abandoned_at: string | null
  composio_entity_id: string | null
  composio_entity_created: boolean | null
  vps_instance_id: string | null
  vps_ip: string | null
  dashboard_url: string | null
  stripe_session_id: string | null
  payment_status: string | null
  user_telegram_bot_token: string | null
  user_whatsapp_number: string | null
  user_slack_webhook_url: string | null
  user_discord_webhook_url: string | null
  created_at: string
}

export async function getOnboardingByUserId(
  clerkUserId: string
): Promise<OnboardingRow | null> {
  const { data } = await supabaseAdmin
    .from('onboarding_submissions')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()
  return data as OnboardingRow | null
}

export async function updateOnboardingStatus(
  clerkUserId: string,
  updates: Partial<OnboardingRow>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('onboarding_submissions')
    .update(updates)
    .eq('clerk_user_id', clerkUserId)

  if (error) {
    throw new Error(`Failed to update onboarding: ${error.message}`)
  }
}

export async function checkUserHasVPS(clerkUserId: string): Promise<boolean> {
  const row = await getOnboardingByUserId(clerkUserId)
  return !!(row?.vps_instance_id)
}

// ─── Provisioning log helpers ────────────────────────────────────────────

export async function logProvisioningEvent(params: {
  userId: string
  action: string
  payload?: Record<string, unknown>
  response?: Record<string, unknown>
  status?: string
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('provisioning_logs')
    .insert({
      user_id: params.userId,
      action: params.action,
      payload: params.payload ?? null,
      response: params.response ?? null,
      status: params.status ?? 'ok',
    })

  if (error) {
    // Log to console but don't throw — logging should never break provisioning
    console.error('[provisioning log error]', error.message)
  }
}
