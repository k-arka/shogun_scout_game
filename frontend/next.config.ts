import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images served from the FastAPI backend and local public folder
  images: {
    domains: ["localhost"],
  },
  // Ensure nuqs works with the App Router
  experimental: {},
};

export default nextConfig;
