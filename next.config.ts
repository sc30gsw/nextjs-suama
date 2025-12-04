import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler:true,
  experimental: {
    useCache: true,
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '5mb',
    },
    // nodeMiddleware: true, TODO:Server Componentsの脆弱性のため、一時コメントアウト。v16 のマイグレート時に再度有効化
  },
}

export default nextConfig
