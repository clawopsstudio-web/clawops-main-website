'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-16">
        <div className="min-h-screen bg-[#0a0a0a] text-white">

          {/* Hero */}
          <div className="max-w-2xl mx-auto px-6 pt-32 pb-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
              CONTACT
            </p>
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4 leading-none"
              style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}
            >
              Let&apos;s talk.
            </h1>
            <p className="text-white/50 text-base">
              Questions, partnerships, or just want to say hi — we&apos;re here.
            </p>
          </div>

          {/* Contact options */}
          <div className="px-6 pb-24 max-w-2xl mx-auto">

            <div className="space-y-4 mb-12">
              {/* Email */}
              <a
                href="mailto:hello@clawops.studio"
                className="flex items-center gap-4 bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/15 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[#e8ff47]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">Email us</div>
                  <div className="text-white/50 text-sm">hello@clawops.studio</div>
                </div>
                <svg className="w-4 h-4 text-white/20 ml-auto group-hover:text-[#e8ff47] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/clawops"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/15 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[#e8ff47]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">Telegram</div>
                  <div className="text-white/50 text-sm">@clawops — support channel</div>
                </div>
                <svg className="w-4 h-4 text-white/20 ml-auto group-hover:text-[#e8ff47] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>

            {/* Contact form */}
            <div className="bg-[#111] rounded-2xl border border-white/7 p-6">
              <h2 className="text-white font-bold text-base mb-5">Send a message</h2>

              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-[#e8ff47]/10 border border-[#e8ff47]/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-[#e8ff47]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold mb-2">Message sent!</h3>
                  <p className="text-white/50 text-sm">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#e8ff47] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#e8ff47] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What's on your mind?"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#e8ff47] transition-colors text-sm resize-none"
                    />
                  </div>
                  {status === 'error' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      Something went wrong. Try emailing us directly at hello@clawops.studio
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-[#0a0a0a] font-bold rounded-xl transition-colors"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send message →'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
