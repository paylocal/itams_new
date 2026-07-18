const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "layout", "header.tsx");
let content = fs.readFileSync(file, "utf-8");

// Thay roleKeys cu the bang dynamic
content = content.replace(
  /const roleKeys[^=]*=[\s\S]*?};/m,
  `// Role labels hardcoded vi i18n provider dong can thoi gian load
const fallbackRoles: any = {
  ADMIN: "Quan tri vien",
  MANAGER: "Quan ly",
  IT_STAFF: "IT",
  PURCHASING: "Mua sam",
  EMPLOYEE: "Nhan vien",
};`
);

// Thay t(roles.X) thanh fallback
content = content.replace(
  /t\(roleKeys\[user.role\] \|\| user\.role\)/g,
  `t("roles." + user.role) !== "roles." + user.role ? t("roles." + user.role) : (fallbackRoles[user.role] || user.role)`
);

fs.writeFileSync(file, content);
console.log("Updated header");