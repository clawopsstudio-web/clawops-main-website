'use client';

import { motion } from 'framer-motion';
import { Typewriter } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#04040c]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00D4FF]/10 via-transparent to-transparent" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00D4FF]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-sm text-[#00D4FF] mb-8"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          9 agents working right now
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          They don't wait for you.{' '}
          <span className="text-[#00D4FF]">They work while you sleep.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-white/60 mb-10 max-w-2xl mx-auto"
        >
          Hire an AI team. Sales, marketing, research, operations. 
          Agents with names, roles, and track records. 
          They run 24/7 on cron. On heartbeat. On triggers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-8 py-4 bg-[#00D4FF] text-[#04040c] font-semibold rounded-xl hover:bg-[#00D4FF]/90 transition-colors">
            Deploy your team →
          </button>
          <button className="px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors">
            Browse agents
          </button>
        </motion.div>

        {/* Live feed preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-3 text-left"
        >
          {[
            { agent: 'Ryan', action: 'sent 47 cold emails', time: '2m ago', color: '#00D4FF' },
            { agent: 'Tyler', action: 'posted week 3 content', time: '8m ago', color: '#6600FF' },
            { agent: 'Arjun', action: 'scraped competitor prices', time: '15m ago', color: '#10b981' },
          ].map((item, i) => (
            <motion.div
              key={item.agent}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white font-medium text-sm">{item.agent}</span>
              <span className="text-white/50 text-sm">{item.action}</span>
              <span className="text-white/30 text-xs ml-auto">{item.time}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
