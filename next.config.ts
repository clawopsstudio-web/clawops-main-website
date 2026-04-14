import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable trailing slashes so /api/proxy/{userId}/n8n/ doesn't redirect to no-slash
  // The OAuth callback is a route handler (not a page), so it's unaffected
  trailingSlash: true,
};

export default nextConfig;
