/** @type {import('next').NextConfig} */

const { config } = require("dotenv");

config();

const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "drive.google.com"],
    minimumCacheTTL: 600,
  },
  transpilePackages: ['lucide-react'] 
};

module.exports = nextConfig;
