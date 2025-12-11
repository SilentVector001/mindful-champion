/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: ['pickleball.com', 'images.unsplash.com', 'cdn.pickleballbrackets.com'],
  },
};

module.exports = nextConfig;
