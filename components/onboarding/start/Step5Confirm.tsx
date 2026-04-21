'use client'

import { motion } from 'framer-motion'
import { StartFormData, PLAN_LABELS, GOAL_LABELS } from '@/lib/start-form'

interface Step5ConfirmProps {
  data: StartFormData
  onSubmit: () => void
  isSubmitting: boolean
}

const TOOL_LABELS: Record<string, string> = {
  hubspot: 'HubSpot', gohighlevel: 'GoHighLevel', pipedrive: 'Pipedrive', notion_crm: 'Notion CRM', none_crm: 'None',
  gmail: 'Gmail', outlook: 'Outlook', other_email: 'Other email',
  slack: 'Slack', discord: 'Discord', telegram: 'Telegram', whatsapp: 'WhatsApp',
  notion: 'Notion', google_drive: 'Google Drive', airtable: 'Airtable', confluence: 'Confluence',
  linkedin: 'LinkedIn', twitter: 'Twitter', instagram: 'Instagram', tiktok: 'TikTok',
}

export default function Step5Confirm({ data, onSubmit, isSubmitting }: Step5ConfirmProps) {
  const allTools = [
    ...data.tools_crm.filter(t => t !== 'none_crm'),
    ...data.tools_email,
    ...data.tools_comms,
    ...data.tools_workspace,
    ...data.tools_social,
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">You&apos;re almost in.</h2>
        <p className="text-[#666] text-sm">Review your setup and complete payment to activate your OS.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT — What you're getting */}
        <div className="bg-[#111] rounded-2xl border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#e8ff47] uppercase tracking-wider">What you&apos;re getting</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#666] text-xs w-20 shrink-0 pt-0.5">Agent name</span>
              <span className="text-[#f0f0f0] text-sm font-medium">{data.agent_name || '—'}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#666] text-xs w-20 shrink-0 pt-0.5">Plan</span>
              <span className="text-[#f0f0f0] text-sm font-medium">{PLAN_LABELS[data.plan] || data.plan}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#666] text-xs w-20 shrink-0 pt-0.5">Goals</span>
              <div className="space-y-1">
                {data.goals.map(g => (
                  <div key={g} className="text-[#f0f0f0] text-xs">
                    {GOAL_LABELS[g] || g}
                  </div>
                ))}
              </div>
            </div>
            {allTools.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-[#666] text-xs w-20 shrink-0 pt-0.5">Tools</span>
                <div className="flex flex-wrap gap-1">
                  {allTools.map(t => (
                    <span key={t} className="text-[10px] bg-[#1a1a1a] text-[#666] px-2 py-0.5 rounded">
                      {TOOL_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — What happens next */}
        <div className="bg-[#111] rounded-2xl border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#e8ff47] uppercase tracking-wider">What happens next</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e8ff47] flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-[#f0f0f0] text-sm font-medium">Payment confirmed</div>
              </div>
            </div>

            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.15)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#666]" />
              </div>
              <div>
                <div className="text-[#666] text-sm">Your OS is being built <span className="text-[10px]">(up to 2 hrs)</span></div>
              </div>
            </div>

            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.15)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#666]" />
              </div>
              <div>
                <div className="text-[#666] text-sm">Agents configured &amp; deployed</div>
              </div>
            </div>

            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.15)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#666]" />
              </div>
              <div>
                <div className="text-[#666] text-sm">Dashboard link sent to your email</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment placeholder */}
      <div className="bg-[#111] rounded-2xl border border-[rgba(232,255,71,0.2)] p-5">
        <div className="text-center mb-4">
          <div className="text-sm font-bold text-white mb-1">Complete your payment</div>
          <div className="text-xs text-[#666]">
            {/* TODO: Replace with Stripe Checkout redirect */}
            {/* STRIPE_PRICE_IDS will be added when Pulkit provides Stripe keys */}
            {/* stripe.redirectToCheckout({ priceId: PLAN_PRICE_IDS[data.plan] }) */}
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? 'Setting up...' : `Activate my OS — ${PLAN_LABELS[data.plan]}`}
        </button>
        <p className="text-center text-[10px] text-[#666] mt-3">
          Questions?{' '}
          <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">
            hello@clawops.studio
          </a>
        </p>
      </div>
    </motion.div>
  )
}
