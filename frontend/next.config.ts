import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images served from the FastAPI backend and local public folder
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ensure nuqs works with the App Router
  experimental: {},
  // Explicitly deny sensitive device APIs to suppress browser permission popups on deployment
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), hid=(), window-management=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
