import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    reactCompiler: true,
    useCache: true,
    ppr: 'incremental',
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

export default nextConfig
