/**
 * Integration helpers using EXISTING Supabase tables.
 * These tables exist in the DB schema and can be used immediately.
 *
 * Tables used:
 * - api_keys        → LLM provider API keys (OpenAI, Anthropic, Google AI, Groq)
 * - channel_configs → Messaging integrations (Telegram, WhatsApp, Discord, Slack)
 * - oauth_tokens    → OAuth connections (Google Workspace, etc.)
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function getServiceSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
    if (payload.exp && Date.now() >= payload.exp * 1000) return null
    if (!payload.iss || !payload.iss.includes('.supabase.co/auth/v1')) return null
    if (payload.ref !== 'dyzkfmdjusdyjmytgeah') return null
    return payload.sub as string
  } catch { return null }
}

// ─── API Keys (LLM providers) ───────────────────────────────────────────────

export async function getApiKeys(userId: string): Promise<Record<string, { key: string; label?: string }>> {
  try {
    const sb = getServiceSupabase()
    const { data } = await sb
      .from('api_keys')
      .select('provider, encrypted_key, key_label')
      .eq('user_id', userId)
    if (!data) return {}
    const result: Record<string, { key: string; label?: string }> = {}
    for (const row of data) {
      result[row.provider] = { key: row.encrypted_key, label: row.key_label }
    }
    return result
  } catch {
    return {}
  }
}

export async function saveApiKey(
  userId: string,
  provider: string,
  apiKey: string,
  label?: string
): Promise<{ success: boolean; error?: string }> {
  const sb = getServiceSupabase()
  const { error } = await sb
    .from('api_keys')
    .upsert({
      user_id: userId,
      provider,
      encrypted_key: apiKey,
      key_label: label || provider,
    }, { onConflict: 'user_id,provider' })
  return { success: !error, error: error?.message }
}

export async function deleteApiKey(userId: string, provider: string) {
  const sb = getServiceSupabase()
  await sb.from('api_keys').delete().eq('user_id', userId).eq('provider', provider)
}

// ─── Channel Configs (messaging) ──────────────────────────────────────────

export async function getChannelConfigs(userId: string): Promise<Record<string, Record<string, string>>> {
  try {
    const sb = getServiceSupabase()
    const { data } = await sb
      .from('channel_configs')
      .select('channel_type, encrypted_credentials')
      .eq('user_id', userId)
      .eq('is_active', true)
    if (!data) return {}
    const result: Record<string, Record<string, string>> = {}
    for (const row of data) {
      if (row.encrypted_credentials) {
        result[row.channel_type] = row.encrypted_credentials as Record<string, string>
      }
    }
    return result
  } catch {
    return {}
  }
}

export async function saveChannelConfig(
  userId: string,
  channelType: string,
  credentials: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const sb = getServiceSupabase()
  const { error } = await sb
    .from('channel_configs')
    .upsert({
      user_id: userId,
      channel_type: channelType,
      encrypted_credentials: credentials,
      is_active: true,
    }, { onConflict: 'user_id,channel_type' })
  return { success: !error, error: error?.message }
}

export async function deleteChannelConfig(userId: string, channelType: string) {
  const sb = getServiceSupabase()
  await sb.from('channel_configs').delete().eq('user_id', userId).eq('channel_type', channelType)
}

// ─── Unified integration fetch ─────────────────────────────────────────────

export async function getAllIntegrations(userId: string) {
  const [apiKeys, channels] = await Promise.all([
    getApiKeys(userId),
    getChannelConfigs(userId),
  ])
  return { apiKeys, channels }
}
