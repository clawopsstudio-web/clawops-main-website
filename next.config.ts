import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // trailingSlash disabled — we handle all redirects explicitly
  // Enabling it causes 308 redirects that break the OAuth callback chain
  // because Cloudflare/Vercel cache the trailing-slash redirect
};

export default nextConfig;
