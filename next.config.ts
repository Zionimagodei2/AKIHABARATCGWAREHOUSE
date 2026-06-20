import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.fujicardshop.com",
      },
      {
        protocol: "https",
        hostname: "unitedcardswarehousejapanese.com",
      },
      {
        protocol: "https",
        hostname: "kurocardshop.com",
      },
      {
        protocol: "https",
        hostname: "elitetcgboosterbox.com",
      },
      {
        protocol: "https",
        hostname: "tcgcardswarehousejapanese.com",
      },
    ],
  },
};

export default nextConfig;
