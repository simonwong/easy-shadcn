import { createMDX } from 'fumadocs-mdx/next';

import type { NextConfig } from 'next';

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    reactCompiler: true,
  },
};

export default withMDX(nextConfig);
