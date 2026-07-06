const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "next.config.mjs");
const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.qrserver.com"],
  },
  allowedDevOrigins: [
    "http://192.168.10.13:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
  ],
};

export default nextConfig;
`;

fs.writeFileSync(file, content);
console.log("Created next.config.mjs");
