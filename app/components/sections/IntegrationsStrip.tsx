'use client'

import { motion } from 'framer-motion'

const TOOLS = [
  'Gmail', 'Notion', 'Slack', 'Telegram', 'HubSpot',
  'GoHighLevel', 'Discord', 'Stripe', 'Shopify', 'Zapier',
  'Google Calendar', 'Airtable', 'Intercom', 'WhatsApp', 'Linear',
]

function ToolBadge({ name }: { name: string }) {
  return (
    <div className="bg-[#111] border border-white/7 rounded-full px-4 py-2 flex items-center gap-2 hover:border-white/15 transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] opacity-60" />
      <span className="text-white/50 text-xs font-medium whitespace-nowrap">{name}</span>
    </div>
  )
}

export default function IntegrationsStrip() {
  return (
    <section className="bg-[#0a0a0a] py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(232,255,71,0.5)] mb-4">
            INTEGRATIONS
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white"
            style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}>
            850+ tools. All pre-wired.
          </h2>
          <p className="text-white/40 text-sm mt-2">
            Agents connect to your existing stack on day one.
          </p>
        </motion.div>

        {/* Scrolling marquee row */}
        <div className="relative overflow-hidden">
          <div className="flex gap-3 flex-wrap justify-center">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <ToolBadge name={tool} />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            + 835 more via Composio + Smithery MCP
          </span>
        </motion.div>
      </div>
    </section>
  )
}
