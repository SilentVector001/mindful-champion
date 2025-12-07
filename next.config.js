/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Optimize serverless function sizes
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/webpack',
        'node_modules/terser',
        'node_modules/@prisma/engines/**',
        'node_modules/prisma/build/**',
        '.git/**',
        'public/**',
        'docs/**',
        'scripts/**',
      ],
    },
  },
  // Reduce function bundle sizes
  outputFileTracing: true,
  // Optimize bundle size
  swcMinify: true,
};

module.exports = nextConfig;
