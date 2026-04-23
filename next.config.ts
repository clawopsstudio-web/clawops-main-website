import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['node-ssh', 'ssh2', 'cpu-features', 'ssh2-streams'],
  turbopack: {
    root: __dirname,
  },
  // trailingSlash is DISABLED - our proxy routes depend on consistent slash handling.
  trailingSlash: false,
};

export default nextConfig;
