const fs = require("fs");
const path = require("path");

const viPath = path.join(__dirname, "src", "messages", "vi", "common.json");
const enPath = path.join(__dirname, "src", "messages", "en", "common.json");

const vi = JSON.parse(fs.readFileSync(viPath, "utf-8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));

// Them cac key moi
const newKeys = {
  common: {
    ...vi.common,
    totalLabel: "Tong cong",
  },
  po: {
    ...vi.po,
    selectItems: "Chon mat hang",
  },
};

const newEnKeys = {
  common: {
    ...en.common,
    totalLabel: "Total",
  },
  po: {
    ...en.po,
    selectItems: "Select Items",
  },
};

fs.writeFileSync(viPath, JSON.stringify(newKeys, null, 2));
fs.writeFileSync(enPath, JSON.stringify(newEnKeys, null, 2));

console.log("Updated");