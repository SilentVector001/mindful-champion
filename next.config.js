const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  
  // Optimize for Vercel deployment - reduce memory usage
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },
  
  // Skip linting during build (Vercel has memory/time limits)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript checking during build (prevents memory issues)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization configuration
  images: { 
    unoptimized: true,
    domains: [
      'abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2.s3.us-west-2.amazonaws.com',
      'img.youtube.com',
      'i.ytimg.com',
    ],
  },
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Webpack optimization for smaller bundles and less memory usage
  webpack: (config, { isServer }) => {
    // Reduce bundle size by excluding unnecessary polyfills for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
