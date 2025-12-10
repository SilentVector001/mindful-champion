/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Externalize heavy packages to reduce serverless function size
  serverExternalPackages: [
    '@tensorflow/tfjs-node',
    '@tensorflow-models/pose-detection',
    '@mediapipe/pose',
    '@mediapipe/tasks-vision',
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    'sharp',
    'canvas',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize heavy packages for server-side
      config.externals = config.externals || [];
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
        '@tensorflow-models/pose-detection': 'commonjs @tensorflow-models/pose-detection',
        '@mediapipe/pose': 'commonjs @mediapipe/pose',
        '@mediapipe/tasks-vision': 'commonjs @mediapipe/tasks-vision',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
        'sharp': 'commonjs sharp',
        'canvas': 'commonjs canvas',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
