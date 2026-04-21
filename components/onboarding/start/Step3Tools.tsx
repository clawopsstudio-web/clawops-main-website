'use client'

import { motion } from 'framer-motion'
import { StartFormData, TOOLS_CRM, TOOLS_EMAIL, TOOLS_COMMS, TOOLS_WORKSPACE, TOOLS_SOCIAL } from '@/lib/start-form'

interface Step3ToolsProps {
  data: StartFormData
  updateData: (updates: Partial<StartFormData>) => void
}

interface ToolGroupProps {
  title: string
  items: { id: string; label: string }[]
  selected: string[]
  onToggle: (ids: string[]) => void
}

function ToolGroup({ title, items, selected, onToggle }: ToolGroupProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onToggle(selected.filter(s => s !== id))
    } else {
      onToggle([...selected, id])
    }
  }
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#f0f0f0] mb-3 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`
                px-3 py-2 rounded-lg border text-sm transition-all duration-200
                ${isSelected
                  ? 'bg-[rgba(232,255,71,0.1)] border-[#e8ff47] text-[#e8ff47]'
                  : 'bg-[#111] border-[rgba(255,255,255,0.07)] text-[#666] hover:border-[rgba(255,255,255,0.15)] hover:text-[#f0f0f0]'
                }
              `}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Step3Tools({ data, updateData }: Step3ToolsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Connect your tools</h2>
        <p className="text-[#666] text-sm">Select the apps your agent should connect to. You can always add more later.</p>
      </div>

      <div className="space-y-6">
        <ToolGroup
          title="CRM"
          items={TOOLS_CRM}
          selected={data.tools_crm}
          onToggle={(v) => updateData({ tools_crm: v })}
        />
        <ToolGroup
          title="Email"
          items={TOOLS_EMAIL}
          selected={data.tools_email}
          onToggle={(v) => updateData({ tools_email: v })}
        />
        <ToolGroup
          title="Comms"
          items={TOOLS_COMMS}
          selected={data.tools_comms}
          onToggle={(v) => updateData({ tools_comms: v })}
        />
        <ToolGroup
          title="Workspace"
          items={TOOLS_WORKSPACE}
          selected={data.tools_workspace}
          onToggle={(v) => updateData({ tools_workspace: v })}
        />
        <ToolGroup
          title="Social"
          items={TOOLS_SOCIAL}
          selected={data.tools_social}
          onToggle={(v) => updateData({ tools_social: v })}
        />
      </div>
    </motion.div>
  )
}
