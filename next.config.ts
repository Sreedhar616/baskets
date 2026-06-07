import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly in local dev (avoids the dev optimizer choking on
    // some JPEGs). Production builds on Vercel keep full optimization.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Public product images served from Supabase Storage.
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
