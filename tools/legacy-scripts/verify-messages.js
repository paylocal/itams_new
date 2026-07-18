const fs = require("fs");
const path = require("path");

const viPath = path.join(__dirname, "src", "messages", "vi", "common.json");
const enPath = path.join(__dirname, "src", "messages", "en", "common.json");

const vi = JSON.parse(fs.readFileSync(viPath, "utf-8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));

// Kiem tra key can thiet
const requiredKeys = {
  nav: ["dashboard", "requests", "approvals", "assets", "purchaseOrders", "categories", "suppliers", "users"],
  common: ["appName", "login", "logout", "save", "cancel"],
  dashboard: ["title", "welcome", "totalRequests", "pending", "completed", "myAssets"],
  roles: ["ADMIN", "MANAGER", "IT_STAFF", "PURCHASING", "EMPLOYEE"],
};

console.log("=== VI ===");
for (const [section, keys] of Object.entries(requiredKeys)) {
  for (const key of keys) {
    const value = vi[section]?.[key];
    if (value === undefined) {
      console.log("  MISSING: " + section + "." + key);
    }
  }
}

console.log("\n=== EN ===");
for (const [section, keys] of Object.entries(requiredKeys)) {
  for (const key of keys) {
    const value = en[section]?.[key];
    if (value === undefined) {
      console.log("  MISSING: " + section + "." + key);
    }
  }
}