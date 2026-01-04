/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  // Force serverless functions to use Node.js runtime for bcrypt compatibility
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

module.exports = nextConfig;
// Force bcrypt fix rebuild: 1704370700
// Force redeploy Sun Jan  4 13:46:29 UTC 2026
