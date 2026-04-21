"use client";

const productLinks = [
  { label: "The OS", href: "/#capabilities" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing", href: "/pricing" },
];

const companyLinks = [
  { label: "About", href: "/company" },
  { label: "Contact", href: "/company#contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <a href="#" className="inline-flex items-center gap-2 mb-4 group">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: "linear-gradient(135deg, #e8ff47, #e8ff47)",
                  boxShadow: "0 0 16px rgba(0,212,255,0.4)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg group-hover:text-[#e8ff47] transition-colors">ClawOps</span>
            </a>
            <p className="text-[rgba(255,255,255,0.45)] text-sm leading-relaxed max-w-xs">
              The Agentic OS for your business. Deploy AI agent teams that work 24/7 — with 5,400+ skills &amp; plugins included.
            </p>
            <p className="text-[rgba(255,255,255,0.2)] text-[10px] font-mono mt-3">
              Powered by ClawOps's multi-agent runtime
            </p>
            <div className="flex items-center gap-3 mt-6">
              {["Twitter/X", "LinkedIn"].map((label) => (
                <span
                  key={label}
                  aria-label={label}
                  title={`${label} link coming soon`}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.28)] border border-[rgba(255,255,255,0.08)] cursor-default"
                >
                  <span className="text-[10px] font-mono">--</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-[rgba(255,255,255,0.4)] hover:text-white text-sm transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-[rgba(255,255,255,0.4)] hover:text-white text-sm transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Cookie Policy", href: "/legal/cookie" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-[rgba(255,255,255,0.4)] hover:text-white text-sm transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[rgba(255,255,255,0.3)] text-sm">
            &copy; {currentYear} ClawOps Studio. All rights reserved.
          </p>
          <p className="text-[rgba(255,255,255,0.2)] text-xs font-mono">
            The Agentic OS for Your Business &middot; 5,400+ Skills &amp; Plugins &middot; Pay once
          </p>
        </div>
      </div>
    </footer>
  );
}
