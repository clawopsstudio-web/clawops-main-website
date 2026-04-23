import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: __dirname,
  },
  trailingSlash: false,
  // node-ssh / ssh2 use native Node.js addons (cpu-features) that Turbopack
  // cannot bundle. They only run server-side in API routes — marked external.
  serverExternalPackages: ['ssh2', 'node-ssh', 'cpu-features'],
}

export default nextConfig
