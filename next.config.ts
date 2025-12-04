import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    useCache: true,
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },

  },
}

export default nextConfig
