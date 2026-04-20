'use client';

import { motion } from 'framer-motion';

const TOOLS = {
  CRM: ['HubSpot', 'Salesforce', 'GoHighLevel', 'Pipedrive', 'Zoho', 'Copper', 'Freshsales'],
  Communication: ['Gmail', 'Slack', 'Discord', 'Telegram', 'WhatsApp', 'Microsoft Teams'],
  Productivity: ['Notion', 'Linear', 'Asana', 'Monday', 'ClickUp', 'Airtable'],
  Marketing: ['Mailchimp', 'Klaviyo', 'SendGrid', 'ConvertKit', 'ActiveCampaign', 'Brevo'],
  Social: ['LinkedIn', 'Instagram', 'Twitter/X', 'TikTok', 'Facebook', 'YouTube'],
  Ecommerce: ['Shopify', 'WooCommerce', 'Stripe', 'Amazon Seller', 'PayPal', 'Squarespace'],
  Developer: ['GitHub', 'GitLab', 'Vercel', 'Netlify', 'Railway', 'Supabase'],
};

function MarqueeRow({ tools, speed = 20 }: { tools: string[]; speed?: number }) {
  const doubled = [...tools, ...tools];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-6"
        animate={{ x: [0, -50 + '%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((tool, i) => (
          <div
            key={`${tool}-${i}`}
            className="shrink-0 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm whitespace-nowrap"
          >
            {tool}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function IntegrationsSection() {
  return (
    <section className="py-24 bg-[#04040c] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4">Works where you already work.</h2>
          <p className="text-white/50 text-lg mb-2">
            850+ integrations via Composio. OAuth in 30 seconds.
          </p>
          <p className="text-white/30 text-sm">
            Agents connect to your tools. You connect to results.
          </p>
        </motion.div>

        {/* Marquee rows — alternating directions */}
        <div className="space-y-6">
          <MarqueeRow tools={TOOLS.CRM} speed={30} />
          <MarqueeRow tools={TOOLS.Communication} speed={25} />
          <MarqueeRow tools={TOOLS.Social} speed={35} />
          <MarqueeRow tools={TOOLS.Productivity} speed={28} />
          <MarqueeRow tools={TOOLS.Marketing} speed={22} />
          <MarqueeRow tools={TOOLS.Ecommerce} speed={32} />
          <MarqueeRow tools={TOOLS.Developer} speed={26} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-block px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm mb-2">Don't see your tool?</p>
            <p className="text-white font-medium">
              Composio connects 850+ apps. If your tool has an API, we can connect it.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
