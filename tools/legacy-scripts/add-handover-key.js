const fs = require("fs");
const path = require("path");

const viPath = path.join(__dirname, "src", "messages", "vi", "common.json");
const enPath = path.join(__dirname, "src", "messages", "en", "common.json");

const vi = JSON.parse(fs.readFileSync(viPath, "utf-8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));

vi.nav = { ...vi.nav, handovers: "Ban giao" };
en.nav = { ...en.nav, handovers: "Handovers" };

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log("Updated");