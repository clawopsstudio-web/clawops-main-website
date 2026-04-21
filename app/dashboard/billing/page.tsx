'use client'

import { motion } from 'framer-motion'

const PLANS = [
  { name: 'Starter', price: '$49/mo', color: '#e8ff47', current: false },
  { name: 'Pro', price: '$149/mo', color: '#e8ff47', current: true },
  { name: 'Agency', price: '$399/mo', color: '#00FF88', current: false },
]

export default function BillingPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(4,4,12,0.8)] backdrop-blur-xl px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">Manage your subscription and payment methods</p>
      </div>

      <div className="px-8 py-6 max-w-2xl space-y-6">
        {/* Current plan */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-xl border border-[rgba(102,0,255,0.3)] bg-[rgba(102,0,255,0.05)] overflow-hidden">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Current Plan</h2>
            <span className="rounded bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] px-2 py-0.5 text-[10px] font-mono text-[#00FF88]">ACTIVE</span>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">Pro</p>
                <p className="text-xs text-[rgba(255,255,255,0.35)] mt-1">3 AI Workers &middot; 500 tasks/mo &middot; 30-day history</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">$149</p>
                <p className="text-xs text-[rgba(255,255,255,0.3)]">/month</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Next billing', value: 'May 8, 2026' },
                { label: 'Payment method', value: 'PayPal ****4242' },
                { label: 'Invoices', value: '3 available' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                  <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{item.label}</p>
                  <p className="mt-0.5 text-xs font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Usage */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Usage This Month</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Tasks used', value: '234', max: '500', color: '#e8ff47', pct: 46 },
              { label: 'API calls', value: '12,450', max: 'Unlimited', color: '#e8ff47', pct: 20 },
              { label: 'Storage', value: '18 GB', max: '60 GB', color: '#00FF88', pct: 30 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">{metric.label}</span>
                  <span className="text-xs text-white font-mono">{metric.value}{metric.max !== 'Unlimited' ? ` / ${metric.max}` : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${metric.pct}%`,
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}aa)`,
                      boxShadow: `0 0 8px ${metric.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* All plans */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">All Plans</h2>
          </div>
          <div className="p-5 space-y-3">
            {PLANS.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: plan.color, boxShadow: `0 0 6px ${plan.color}` }} />
                  <span className="text-sm font-medium text-white">{plan.name}</span>
                  {plan.current && <span className="text-[10px] font-mono text-[#e8ff47]">CURRENT</span>}
                </div>
                <span className="text-sm text-[rgba(255,255,255,0.5)]">{plan.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
