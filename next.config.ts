import type { NextConfig } from "next";

// Temporarily disabled PWA for dev server
// const withPWAInit = require("@ducanh2912/next-pwa").default;
// const withPWA = withPWAInit({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
// });

const nextConfig: NextConfig = {};

export default nextConfig;
