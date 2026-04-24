'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Agents', href: '/agents' },
  { label: 'Autopilot', href: '/autopilot' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Done For You', href: '/done-for-you' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e8ff47] flex items-center justify-center">
            <span className="text-[#0a0a0a] font-bold text-sm">CO</span>
          </div>
          <span className="text-white font-bold text-lg">ClawOps</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href="/auth/login" className="hidden md:block text-white/60 hover:text-white text-sm">
            Log In
          </a>
          <a
            href="/auth/signup"
            className="px-4 py-2 bg-[#e8ff47] text-[#0a0a0a] font-semibold text-sm rounded-xl hover:bg-[#e8ff47]/90 transition-colors"
          >
            Start Your OS →
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 p-2"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0a0a0a]/95 px-6 pb-4 space-y-3"
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-white/60 hover:text-white py-2 text-sm"
              >
                {link.label}
              </a>
            ))}
            <a href="/auth/login" className="block text-white/60 py-2 text-sm">
              Log In
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
