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
  
};

export default nextConfig;
