const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "next.config.mjs");
const ip = "192.168.10.13";

const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.qrserver.com"],
  },
  allowedDevOrigins: [
    "http://${ip}:3000",
    "http://localhost:3000",
    "http://0.0.0.0:3000",
  ],
};

export default nextConfig;
`;

fs.writeFileSync(file, nextConfig);
console.log("Updated with IP:", ip);