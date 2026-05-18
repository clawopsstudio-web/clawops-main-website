import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import GlobalStarField from "@/components/ui/GlobalStarField";

export const metadata: Metadata = {
  title: {
    default: 'ClawOps — The OS your business runs on.',
    template: '%s | ClawOps',
  },
  other: {
    // Fallback page titles for pages that cant export metadata (client components)
    // Auth pages
    '/auth/signup': 'Sign Up',
    '/auth/login': 'Log In',
    // Dashboard pages
    '/dashboard': 'Dashboard',
    '/dashboard/chat': 'Chat',
    '/dashboard/agents': 'Agents',
    '/dashboard/tools': 'Tools',
    '/dashboard/plugins': 'Plugins',
    '/dashboard/missions': 'Missions',
    '/dashboard/logs': 'Logs',
    '/dashboard/terminal': 'Mission Control',
  },
  description:
    "We build and manage AI employees for your business. Sales, Support, Research, and Ops employees working 24/7. Flat monthly rate, unlimited actions, zero infrastructure headaches.",
  keywords: "AI workforce, autonomous AI, agentic OS, scale without hiring, business AI automation, AI agents run 24/7, ClawOps, autonomous business, AI that runs itself, AI employees for business",
  metadataBase: new URL('https://clawops.studio'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    title: "ClawOps — The Agentic OS for Businesses That Scale",
    description:
      "We build and manage AI employees for your business. Sales, Support, Research, and Ops employees working 24/7. Flat monthly rate, unlimited actions.",
    type: "website",
    locale: "en_US",
    siteName: "ClawOps",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawOps — The Agentic OS for Businesses That Scale",
    description:
      "We build and manage AI employees for your business. Scale without hiring.",
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
  '@type': 'Service',
  name: 'ClawOps — AI Employee Service',
  description: 'We build and manage unlimited AI employees for your business. One flat monthly rate. Sales, support, research, ops, and finance agents working 24/7.',
  applicationCategory: 'ProfessionalService',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '499',
    highPrice: '499',
    priceCurrency: 'USD',
    offerCount: '1',
    availability: 'https://schema.org/InStock',
  },
  provider: {
    '@type': 'Organization',
    name: 'ClawOps Studio',
    url: 'https://clawops.studio',
  },
  areaServed: {
    '@type': 'Worldwide',
  },
  serviceType: 'AI Employee Agency',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        <body className="bg-[#0a0a0a] text-white antialiased overflow-x-hidden">
          <GlobalStarField />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </body>
    </html>
  );
}
