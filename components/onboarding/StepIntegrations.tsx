'use client'

import { motion } from 'framer-motion'
import { OnboardingData } from '@/lib/onboarding'

interface StepIntegrationsProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const integrations = [
  { id: 'ghl', label: 'GoHighLevel (GHL)', icon: '🔗' },
  { id: 'hubspot', label: 'HubSpot', icon: '🟠' },
  { id: 'salesforce', label: 'Salesforce', icon: '☁️' },
  { id: 'zapier', label: 'Zapier / Make', icon: '⚡' },
  { id: 'n8n', label: 'n8n', icon: '🔧' },
  { id: 'notion', label: 'Notion', icon: '📓' },
  { id: 'slack', label: 'Slack', icon: '💬' },
  { id: 'gmail', label: 'Gmail / Google Workspace', icon: '📧' },
]

export default function StepIntegrations({ data, updateData }: StepIntegrationsProps) {
  const toggleIntegration = (id: string) => {
    const current = data.integrations
    const updated = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id]
    updateData({ integrations: updated })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect your tools</h2>
        <p className="text-gray-400 text-sm">Which tools do you already use? (Select all that apply)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {integrations.map((integration) => {
          const isSelected = data.integrations.includes(integration.id)
          return (
            <button
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'bg-cyan-600/10 border-cyan-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                }
              `}
            >
              <span className="text-xl">{integration.icon}</span>
              <span className="text-sm font-medium">{integration.label}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
