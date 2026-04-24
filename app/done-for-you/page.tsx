import Navigation from "../components/Navigation"
import Footer from "../../components/sections/Footer"

export const metadata = {
  title: "Done For You — ClawOps",
}

export default function DoneForYouPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#e8ff47]/10 border border-[#e8ff47]/20 text-[#e8ff47] px-4 py-1.5 rounded-full text-xs font-medium mb-8">
            Done For You
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            We build and run your entire AI agent stack — you just show up.
          </h1>
          <p className="text-white/50 text-lg mb-10">
            For teams that want the outcome, not the setup.
          </p>
          <div className="space-y-4 mb-12 text-left max-w-lg mx-auto">
            {[
              "We configure your agents with your industry, goals, and tone of voice",
              "We connect Gmail, Slack, Notion, and every tool you use",
              "We monitor and optimise every week — no extra cost",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-white/70 text-sm">
                <span className="text-[#e8ff47] mt-0.5">✓</span>
                {item}
              </div>
            ))}
          </div>
          <a
            href="/contact"
            className="inline-block bg-[#e8ff47] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl hover:bg-[#d4eb3a] transition-colors"
          >
            Book a Call →
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
