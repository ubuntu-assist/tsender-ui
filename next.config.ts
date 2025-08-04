import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: '',
  trailingSlash: true,
  assetPrefix: '/',
}

export default nextConfig
