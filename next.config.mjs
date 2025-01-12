/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  output: 'standalone',
  reactStrictMode: false,
  images: {
    // 允许远程的图片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'static.askme.run',
      },
    ],
  },
};

export default nextConfig;
