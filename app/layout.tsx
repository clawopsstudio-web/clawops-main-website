import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import GlobalStarField from "@/components/ui/GlobalStarField";

export const metadata: Metadata = {
  title: "ClawOps — AI Workers That Run in Your Apps",
  description:
    "Preconfigured AI workers deployed through Telegram, WhatsApp, Slack, and browser sessions — support, research, content, and ops, running 24/7 without prompt engineering.",
  keywords: "AI workers, AI automation, AI assistants, messaging AI, browser automation, ClawOps",
  openGraph: {
    title: "ClawOps — AI Workers That Run in Your Apps",
    description:
      "Preconfigured AI workers deployed through Telegram, WhatsApp, Slack, and browser sessions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawOps — AI Workers That Run in Your Apps",
    description:
      "Preconfigured AI workers deployed through Telegram, WhatsApp, Slack, and browser sessions.",
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
