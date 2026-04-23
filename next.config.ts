/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['node-ssh', 'ssh2', 'cpu-features', 'ssh2-streams'],
  trailingSlash: false,
}

module.exports = nextConfig
