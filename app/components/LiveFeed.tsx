'use client';

import { motion } from 'framer-motion';

const ACTIVITY_ITEMS = [
  { agent: 'Ryan', action: 'Qualified 12 leads from SaaS companies', time: '3 min ago' },
  { agent: 'Arjun', action: 'Researched 8 competitors in fintech space', time: '8 min ago' },
  { agent: 'Helena', action: 'Handled 5 support tickets', time: '12 min ago' },
  { agent: 'Ryan', action: 'Sent outreach to 20 prospects', time: '15 min ago' },
  { agent: 'Arjun', action: 'Generated market report for Q4', time: '22 min ago' },
  { agent: 'Helena', action: 'Escalated 2 complex tickets to human', time: '31 min ago' },
  { agent: 'Ryan', action: 'Enriched 45 LinkedIn profiles', time: '45 min ago' },
  { agent: 'Arjun', action: 'Monitored 15 news sources', time: '1 hr ago' },
  { agent: 'Helena', action: 'Drafted 8 support replies', time: '1.5 hr ago' },
  { agent: 'Ryan', action: 'Updated CRM with 30 new contacts', time: '2 hr ago' },
];

const AGENT_COLORS: Record<string, string> = {
  Ryan: '#e8ff47',
  Arjun: '#10b981',
  Helena: '#f59e0b',
};

export default function LiveFeed() {
  // Duplicate items for seamless loop
  const items = [...ACTIVITY_ITEMS, ...ACTIVITY_ITEMS];

  return (
    <section className="py-16 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
      <div className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-white/30">
              Live Agent Activity
            </span>
          </div>
        </div>
      </div>

      {/* Auto-scrolling ticker */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 animate-ticker">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#111] border border-white/8 whitespace-nowrap"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: AGENT_COLORS[item.agent] ?? '#e8ff47' }}
              />
              <span
                className="text-sm font-bold shrink-0"
                style={{ color: AGENT_COLORS[item.agent] ?? '#e8ff47' }}
              >
                {item.agent}
              </span>
              <span className="text-white/50 text-sm">→</span>
              <span className="text-white/70 text-sm">{item.action}</span>
              <span className="text-white/25 text-xs shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
          width: max-content;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
