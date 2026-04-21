import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import GlobalStarField from "@/components/ui/GlobalStarField";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "ClawOps — The Agentic OS for Businesses That Scale",
    template: "%s | ClawOps",
  },
  description:
    "The autonomous AI OS for businesses that want to scale without hiring.  Sales, Support, Research, and Ops agents that run 24/7 — autonomously. Manage from Telegram, WhatsApp, or Slack. Flat monthly pricing from $49/mo.",
  keywords: "AI workforce, autonomous AI, agentic OS, scale without hiring, business AI automation, AI agents run 24/7, ClawOps, autonomous business, AI that runs itself",
  metadataBase: new URL('https://app.clawops.studio'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    title: "ClawOps — The Agentic OS for Businesses That Scale",
    description:
      "The autonomous AI OS for businesses.  Agents run your Sales, Support, and Ops 24/7 — without you prompting them. Scale without hiring.",
    type: "website",
    locale: "en_US",
    siteName: "ClawOps",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawOps — The Agentic OS for Businesses That Scale",
    description:
      "Autonomous AI agents that run your business 24/7.  Scale without hiring.",
    creator: "@ClawOps",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦷</text></svg>",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ClawOps — AI Agent Platform',
  description: 'The Agentic OS for businesses that want to scale without hiring.  Autonomous agents running Sales, Support, and Ops 24/7. Flat pricing from $49/mo.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Self-hosted (Ampere ARM)',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '49',
    highPrice: '499',
    priceCurrency: 'USD',
    offerCount: '3',
  },
  provider: {
    '@type': 'Organization',
    name: 'ClawOps Studio',
    url: 'https://app.clawops.studio',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="bg-[#04040c] text-white antialiased overflow-x-hidden">
          <GlobalStarField />
          <SmoothScroll>
            <AuthProvider>{children}</AuthProvider>
          </SmoothScroll>
        </body>
      </html>
    </ClerkProvider>
  );
}
