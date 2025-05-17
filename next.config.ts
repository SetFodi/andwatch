/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log in production
  },
  // Simplified image configuration
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
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      // Add Netlify domain for image serving
      {
        protocol: "https",
        hostname: "your-netlify-app.netlify.app",
        pathname: "/uploads/**",
      }
    ],
    unoptimized: true, // Disable image optimization to fix errors
  },
};

module.exports = nextConfig;