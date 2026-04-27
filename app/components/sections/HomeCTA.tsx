'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const TESTIMONIALS = [
  {
    quote: "Atlas booked me 8 meetings in week one. First time I've had inbound pipeline sorted.",
    name: "Rohan M.",
    role: "Agency Owner, Delhi",
    color: '#e8ff47',
    initials: 'RM',
  },
  {
    quote: "Nova handles all our social. I'm barely on Twitter anymore — and our engagement went up.",
    name: "Sarah K.",
    role: "Marketing Lead, Berlin",
    color: '#a78bfa',
    initials: 'SK',
  },
  {
    quote: "Rex sends me a daily briefing. I deleted my Bloomberg subscription. That's saying something.",
    name: "Aditya P.",
    role: "Founder, Bangalore",
    color: '#34d399',
    initials: 'AP',
  },
]

function TestimonialCard({ t, delay }: { t: typeof TESTIMONIALS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#111] border border-white/7 rounded-2xl p-6"
    >
      {/* Quote mark */}
      <div className="text-3xl font-black mb-3" style={{ color: `${t.color}30`, fontFamily: 'var(--font-display)' }}>
        "
      </div>

      <p className="text-white/60 text-sm leading-relaxed mb-5 italic">
        {t.quote}
      </p>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
          style={{ backgroundColor: `${t.color}20`, color: t.color }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-white text-xs font-semibold">{t.name}</div>
          <div className="text-white/30 text-[10px]">{t.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function HomeCTA() {
  return (
    <section className="bg-[#0a0a0a] py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 0.1} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Your AI team is ready.
          </h2>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            Start with Personal ($49/mo) or go straight to Team ($149/mo). No contracts. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/start"
              className="bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(232,255,71,0.25)]"
            >
              Deploy your agents →
            </Link>
            <Link
              href="/pricing"
              className="text-white/40 hover:text-white/70 text-sm transition-colors font-medium"
            >
              View pricing →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
