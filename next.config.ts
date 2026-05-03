import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // @ts-ignore
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
