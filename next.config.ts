import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['node-ssh', 'ssh2', 'cpu-features', 'ssh2-streams'],
  trailingSlash: false,
}

export default nextConfig
