import type { NextConfig } from 'next';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(resolve(process.cwd(), '..'), process.env.NODE_ENV !== 'production');

const apiOrigin = process.env.CHATRA_API_INTERNAL_URL ?? 'http://127.0.0.1:4001';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['*.e2b.app', 'localhost'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
