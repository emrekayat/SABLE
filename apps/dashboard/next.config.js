/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/aleo-sdk"],
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
