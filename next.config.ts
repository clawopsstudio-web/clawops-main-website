import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No basePath — app serves at / directly, routed by nginx
  turbopack: {
    root: "/root/.openclaw/workspaces/clawops-web",
  },
};

export default nextConfig;
