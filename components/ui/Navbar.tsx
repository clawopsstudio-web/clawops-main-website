"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing", href: "/pricing" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-[rgba(255,255,255,0.07)] bg-[rgba(4,4,12,0.88)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #e8ff47, #e8ff47)",
                boxShadow: "0 0 16px rgba(0,212,255,0.4)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="ml-2 text-white font-bold text-lg">ClawOps</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm text-[rgba(255,255,255,0.55)] transition-all duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/start?plan=personal"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,212,255,0.35)]"
              style={{
                background: "linear-gradient(135deg, #e8ff47, #e8ff47)",
                boxShadow: "0 0 20px rgba(0,212,255,0.25)",
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-white md:hidden"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(4,4,12,0.96)] backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg py-3 text-base text-[rgba(255,255,255,0.7)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl py-3 text-center text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,212,255,0.3)]"
                  style={{
                    background: "linear-gradient(135deg, #e8ff47, #e8ff47)",
                  }}
                >
                  Get Started Free
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
