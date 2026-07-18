const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "next.config.mjs");
let content = fs.readFileSync(file, "utf-8");

// Lay IP tu he thong
const { execSync } = require("child_process");
let ip = "192.168.10.13";
try {
  const output = execSync('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi*).IPAddress | Select-Object -First 1"').toString();
  ip = output.trim() || "192.168.1.100";
} catch (e) {
  // fallback
}

const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.qrserver.com"],
  },
  allowedDevOrigins: [
    "http://${ip}:3000",
    "http://localhost:3000",
  ],
};

export default nextConfig;
`;

fs.writeFileSync(file, nextConfig);
console.log("Updated with IP:", ip);
console.log("File:", file);