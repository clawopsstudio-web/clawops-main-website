import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: __dirname,
  },
  // trailingSlash is DISABLED — our proxy routes depend on consistent slash handling.
  // With true: Next.js redirects /n8n to /n8n/ which breaks auth_request subrequest routing.
  // The proxy regex handles both /n8n and /n8n/ via (?<n8nrest>.*) which captures empty string too.
  trailingSlash: false,
};

export default nextConfig;
