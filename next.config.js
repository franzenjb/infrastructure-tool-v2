/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2/' : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  publicRuntimeConfig: {
    basePath: process.env.NODE_ENV === 'production' ? '/infrastructure-tool-v2' : ''
  }
}

module.exports = nextConfig