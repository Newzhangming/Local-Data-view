/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true, dirs: ['src/app', 'src/components', 'src/constants', 'src/services', 'src/utils'] },
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
    ],
  },
  allowedDevOrigins: ['192.168.2.28', 'localhost', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
