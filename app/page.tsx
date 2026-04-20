import Navigation from './components/Navigation';
import HeroSection from './HeroSection';
import LiveFeed from './components/LiveFeed';
import ProblemSection from './ProblemSection';
import HowItWorks from './components/HowItWorks';
import AgentCardsGrid from './components/AgentCard';
import UseCasesSection from './components/UseCasesSection';
import IntegrationsSection from './components/IntegrationsSection';
import PricingSection from './components/PricingSection';
import CompanySection from './components/CompanySection';

export default function Home() {
  return (
    <main className="bg-[#04040c] min-h-screen">
      <Navigation />
      <HeroSection />
      <LiveFeed />
      <ProblemSection />
      <HowItWorks />
      <AgentCards />
      <UseCasesSection />
      <IntegrationsSection />
      <PricingSection />
      <CompanySection />
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#04040c]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center">
                  <span className="text-[#04040c] font-bold text-sm">CO</span>
                </div>
                <span className="text-white font-bold">ClawOps Studio</span>
              </div>
              <p className="text-white/40 text-sm">Agentic OS for businesses.</p>
            </div>
            <div>
              <h4 className="text-white/40 text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                {['Agents', 'Use Cases', 'How It Works', 'Integrations', 'Pricing'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/40 text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Legal', 'Contact'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/40 text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Definitions', 'Cookie Policy'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © 2026 ClawOps Studio. All rights reserved.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                <a key={social} href="#" className="text-white/30 hover:text-white text-sm transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
