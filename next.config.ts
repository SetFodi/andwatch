// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "http", // For local dev
        hostname: "localhost", // Your development hostname
        port: "3000", // The port your app runs on
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
