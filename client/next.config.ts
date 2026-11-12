import type { NextConfig } from 'next';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(resolve(process.cwd(), '..'), process.env.NODE_ENV !== 'production');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ['*.e2b.app', 'localhost'],
};

export default nextConfig;
