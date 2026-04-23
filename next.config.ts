import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['node-ssh', 'ssh2', 'cpu-features', 'ssh2-streams'],
  // trailingSlash is DISABLED - our proxy routes depend on consistent slash handling.
  trailingSlash: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'cpu-features': false,
        'ssh2': false,
        'node-ssh': false,
      }
    }
    return config
  },
};

export default nextConfig;
