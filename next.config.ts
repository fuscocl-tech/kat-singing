import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain HTML/JS files served by Firebase Hosting (free Spark plan); no server.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
