'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function VideoSection() {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="relative py-16 md:py-24 px-6 lg:px-12" style={{ background: 'linear-gradient(180deg, #04040c 0%, #08081a 50%, #0a0a1a 100%)' }}>
      {/* Subtle glow behind video */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
      }} />

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">See It in Action</h2>
          <p className="text-sm text-[rgba(255,255,255,0.4)]">Real agent workflows. Click to watch.</p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]"
          style={{ boxShadow: '0 0 80px rgba(0,212,255,0.06), 0 25px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="relative aspect-video bg-[#06060f]">
            {playing ? (
              <video
                src="/clawops-ai-os-demo.mp4"
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
                onEnded={() => setPlaying(false)}
              />
            ) : (
              <>
                {/* Poster image */}
                <Image
                  src="/clawops-ai-os-hero.jpg"
                  alt="ClawOps — AI agent dashboard demo"
                  fill
                  className="object-cover"
                  priority={false}
                />

                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06060f] via-[rgba(6,6,15,0.15)] to-transparent" />

                {/* Play button */}
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                  aria-label="Play demo video"
                >
                  {/* Glow ring */}
                  <div className="absolute w-24 h-24 rounded-full bg-[rgba(0,212,255,0.08)] backdrop-blur-sm" />

                  {/* Play button circle */}
                  <div className="relative w-20 h-20 rounded-full bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-14 h-14 rounded-full bg-[#00D4FF] flex items-center justify-center shadow-lg shadow-[#00D4FF]/30">
                      <svg className="w-5 h-5 text-[#06060f] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Badge */}
                <div className="absolute bottom-4 left-4 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] text-[#00D4FF] text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                  12-second demo
                </div>
              </>
            )}
          </div>
        </motion.div>

        <p className="text-center text-[rgba(255,255,255,0.25)] text-xs mt-4">
          Click play to watch — real agent workflows, no staging
        </p>
      </div>
    </section>
  )
}
