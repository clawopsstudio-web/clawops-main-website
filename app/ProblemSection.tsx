'use client';

import { motion } from 'framer-motion';

export default function ProblemSection() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            You're hiring one person to do five jobs.
          </h2>
        </motion.div>

        <div className="space-y-8">
          {/* Pain 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <span className="text-4xl">😓</span>
            <div>
              <h4 className="text-white font-bold mb-1">External: The tangible problem</h4>
              <p className="text-white/60">
                You need a sales rep. A content writer. A researcher. An ops manager. A support agent.
                You're one person trying to hire five people.
              </p>
            </div>
          </motion.div>

          {/* Pain 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <span className="text-4xl">😩</span>
            <div>
              <h4 className="text-white font-bold mb-1">Internal: The emotional toll</h4>
              <p className="text-white/60">
                Every hour spent on busywork is an hour not spent on your actual business.
                You're running on fumes.
              </p>
            </div>
          </motion.div>

          {/* Pain 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <span className="text-4xl">💡</span>
            <div>
              <h4 className="text-white font-bold mb-1">Philosophical: Why it's wrong</h4>
              <p className="text-white/60">
                Businesses fail not because founders are lazy. They fail because they run out of time.
              </p>
            </div>
          </motion.div>

          {/* Bridge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#e8ff47]/10 to-[#e8ff47]/10 border border-[#e8ff47]/20"
          >
            <p className="text-xl text-white font-medium mb-2">
              We built something different.
            </p>
            <p className="text-[#e8ff47] text-lg font-bold">
              One subscription. One team. Every role covered.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
