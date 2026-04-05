export default function WhyClawOps() {
  const reasons = [
    {
      title: "No setup weeks",
      description:
        "Most teams spend 2–4 weeks just getting AI tools configured, prompting, and fine-tuned before seeing real value. ClawOps is deployed and running in 48 hours — pre-trained, pre-integrated, ready to work.",
    },
    {
      title: "Works inside your existing apps",
      description:
        "n8n + OpenAI + browser automation sounds powerful — until you realize it doesn't talk to your team, your clients, or your existing tools without serious glue code. ClawOps agents run where your team actually works: Telegram, WhatsApp, Slack, Notion, and your browser.",
    },
    {
      title: "No prompt engineering required",
      description:
        "DIY AI setups need constant prompting, babysitting, and re-prompting to stay useful. ClawOps agents are trained once on your business, then run reliably on their own — no expert prompting skills needed.",
    },
    {
      title: "Built for reliability, not demos",
      description:
        "A working n8n flow on your laptop is not the same as a production agent that handles your real workload. ClawOps handles monitoring, error recovery, and ongoing optimization — so you're not debugging workflows at 11pm.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">
            Why ClawOps vs DIY
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 tracking-tight">
            Why build it yourself when it&apos;s already built?
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mt-4">
            You could spend months stitching together n8n, OpenAI, browser automation,
            and OpenClaw. Or you could have a working AI team in 48 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-[#111] border border-[#1f1f1f] hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
