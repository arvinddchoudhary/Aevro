import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.9'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/image/upload/**',
      },
    ],
    deviceSizes: [360, 480, 640, 768, 960, 1200, 1440],
    imageSizes: [64, 96, 128, 192, 256, 300],
  },
};

export default nextConfig;
