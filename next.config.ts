import type { NextConfig } from "next";

const allowAllHttpsImages = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "linux.do",
      },
      {
        protocol: "https",
        hostname: "*.linux.do",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      ...(allowAllHttpsImages
        ? [
            {
              protocol: "https" as const,
              hostname: "**", // 仅开发环境放开，避免生产环境扩大攻击面
            },
          ]
        : []),
    ],
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
  },
};

export default nextConfig;
