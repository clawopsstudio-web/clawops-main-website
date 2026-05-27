'use client';

import React from 'react';

export default function Pricing() {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="rounded-2xl border border-[#e8ff47] bg-[rgba(102,0,255,0.06)] p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] mb-4">
          <span className="text-xs font-mono text-[#e8ff47]">Simple pricing</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">One plan. Unlimited AI employees.</h3>
        <p className="text-white/50 text-sm mb-6">Everything you need. Deploy in 48 hours.</p>
        <div className="flex items-end justify-center gap-1 mb-6">
          <span className="text-5xl font-bold">$499</span>
          <span className="text-white/40 mb-1 ml-1">/month</span>
        </div>
        <ul className="text-left space-y-2 mb-6">
          {[
            'Unlimited AI Agents',
            'All messaging platforms',
            'Unlimited automations',
            '5 browser sessions',
            'White-label ready',
            '90-day history',
            '1h dedicated support SLA',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/60">
              <span className="text-green-400 flex-shrink-0">&#10003;</span>
              {f}
            </li>
          ))}
        </ul>
        <a
          href="/start"
          className="block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all hover:-translate-y-0.5 bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] text-white"
        >
          Get Started →
        </a>
      </div>
    </div>
  );
}
