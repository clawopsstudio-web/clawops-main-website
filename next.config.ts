import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/site",
  turbopack: {
    root: "/root/.openclaw/workspaces/clawops-web",
  },
};

export default nextConfig;
