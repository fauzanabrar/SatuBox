const million = require("million/compiler");
/** @type {import('next').NextConfig} */

const { config } = require("dotenv");

config();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
      },
    ],
  },
  transpilePackages: ["lucide-react"],
};

module.exports = million.next(nextConfig, { auto: { rsc: true } });
