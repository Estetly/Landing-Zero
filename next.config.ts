import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js Developer Tools ("N" button) in development
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
