import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
