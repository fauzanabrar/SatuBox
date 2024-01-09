/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const { config } = require("dotenv");

config();

const nextConfig = {
  images: {
    domains: ["drive.google.com"],
    minimumCacheTTL: 600,
  },
  transpilePackages: ["lucide-react"],
};

module.exports = withBundleAnalyzer(nextConfig);

