import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Allow the dev server (HMR etc.) to be reached from other devices on the LAN
  allowedDevOrigins: ["192.168.68.60", "192.168.68.*"],
};

export default nextConfig;
