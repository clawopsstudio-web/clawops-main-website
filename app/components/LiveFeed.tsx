'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITY_ITEMS = [
  { agent: 'Ryan', action: 'sent 47 cold emails', time: '2m ago', color: '#00D4FF' },
  { agent: 'Tyler', action: 'shipped this week\'s content', time: '8m ago', color: '#6600FF' },
  { agent: 'Arjun', action: 'scraped competitor prices', time: '15m ago', color: '#10b981' },
  { agent: 'Scout', action: 'qualified 23 new leads', time: '31m ago', color: '#f59e0b' },
  { agent: 'Closer', action: 'closed 2 deals today', time: '42m ago', color: '#ec4899' },
  { agent: 'Helena', action: 'answered 89 tickets', time: '1h ago', color: '#f59e0b' },
  { agent: 'Marcus', action: 'reviewed 12 pull requests', time: '1h ago', color: '#ec4899' },
  { agent: 'Maya', action: 'sent 23 invoices', time: '2h ago', color: '#06b6d4' },
  { agent: 'Scheduler', action: 'ran 89 automations today', time: '2h ago', color: '#06b6d4' },
  { agent: 'Tyler', action: 'posted to LinkedIn', time: '3h ago', color: '#6600FF' },
  { agent: 'Arjun', action: 'found 4 competitor updates', time: '4h ago', color: '#10b981' },
  { agent: 'Ryan', action: 'booked 3 discovery calls', time: '5h ago', color: '#00D4FF' },
];

export default function LiveFeed() {
  const [items, setItems] = useState(ACTIVITY_ITEMS.slice(0, 5));

  useEffect(() => {
    const interval = setInterval(() => {
      const random = ACTIVITY_ITEMS[Math.floor(Math.random() * ACTIVITY_ITEMS.length)];
      setItems(prev => [random, ...prev.slice(0, 6)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#04040c]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live agent activity
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Your team is working right now.
          </h2>
          <p className="text-white/50 text-lg">
            Real-time mission logs from agents deployed on your VPS.
          </p>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={`${item.agent}-${i}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D4FF]/30 transition-colors"
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-white w-28">{item.agent}</span>
                <span className="text-white/60 flex-1">{item.action}</span>
                <span className="text-white/30 text-sm">{item.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
