/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/infrastructure-tool-v2',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig