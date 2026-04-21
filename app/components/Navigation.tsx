'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Agents', href: '/roles' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#04040c]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
            <span className="text-[#04040c] font-bold text-sm">CO</span>
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
            Sign in
          </a>
          <a
            href="/auth/signup"
            className="px-4 py-2 bg-[#00D4FF] text-[#04040c] font-semibold text-sm rounded-xl hover:bg-[#00D4FF]/90 transition-colors"
          >
            Start free →
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
            className="md:hidden border-t border-white/10 bg-[#04040c]/95 px-6 pb-4 space-y-3"
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
              Sign in
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
