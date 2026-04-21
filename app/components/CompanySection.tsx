'use client';

import { motion } from 'framer-motion';

const VALUES = [
  {
    title: 'Ownership',
    desc: 'Every agent you deploy works for you. Your data stays on your VPS. Your agents learn your business. Your workflow, your rules.',
    icon: '🔒',
  },
  {
    title: 'Autonomy',
    desc: 'Agents don\'t need hand-holding. Set the mission. They execute. You review. You decide.',
    icon: '⚡',
  },
  {
    title: 'Speed',
    desc: 'No onboarding calls. No vendor lock-in. Connect your tools in 30 seconds. Agents working in 5 minutes.',
    icon: '🚀',
  },
  {
    title: 'Honesty',
    desc: 'No hype. No buzzwords. If an agent can\'t do something, we\'ll tell you. If there\'s a better tool, we\'ll build it.',
    icon: '💡',
  },
];

export default function CompanySection() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Origin Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            We started ClawOps Studio to solve our own problem.
          </h2>
          <div className="max-w-2xl mx-auto space-y-6 text-lg text-white/60">
            <p>
              "Every founder we knew was drowning. Marketing, sales, ops, support — all on one person's shoulders.
              Hiring costs money. Tools cost time. Neither scale."
            </p>
            <p>
              "We stopped trying to hire faster. We started building agents that could work 24/7, learn their roles, and execute without being prompted."
            </p>
            <p className="text-white/40 italic">
              "One platform. One subscription. Your entire AI team."
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 p-8 rounded-2xl bg-gradient-to-r from-[#e8ff47]/10 to-[#e8ff47]/10 border border-[#e8ff47]/20 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
          <p className="text-white/70 text-lg">
            One person with the right AI team should be able to outperform a company of fifty.
            We're building the infrastructure to make that real.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl mb-4">{value.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{value.title}</h4>
              <p className="text-white/50 text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-3xl font-bold text-white mb-4">Start building your team.</h3>
          <button className="px-8 py-4 bg-[#e8ff47] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#e8ff47]/90 transition-colors">
            Deploy in 5 minutes →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
