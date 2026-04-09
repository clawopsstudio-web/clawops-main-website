import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import GlobalStarField from "@/components/ui/GlobalStarField";

export const metadata: Metadata = {
  title: "ClawOps — Pay for Infrastructure, Not AI Costs",
  description:
    "Pre-configured VPS + local AI agents. No API bills. No per-token costs. Deploy your AI workforce in 3 minutes starting at $49/month.",
  keywords: "AI workers, AI automation, local AI, VPS AI, no API costs, AI infrastructure, ClawOps",
  openGraph: {
    title: "ClawOps — Pay for Infrastructure, Not AI Costs",
    description:
      "Pre-configured VPS + local AI agents. No API bills. Deploy your AI workforce in 3 minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawOps — Pay for Infrastructure, Not AI Costs",
    description:
      "Pre-configured VPS + local AI agents. No API bills. Deploy your AI workforce in 3 minutes.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦷</text></svg>",
  },
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
      </head>
      <body className="bg-[#04040c] text-white antialiased overflow-x-hidden">
        {/* Fixed star field persists across all pages/sections */}
        <GlobalStarField />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
