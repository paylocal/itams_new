const fs = require("fs");
const path = require("path");

const code = `export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}
`;

const dir = path.join(__dirname, "src", "app", "(dashboard)", "dashboard");
const file = path.join(dir, "loading.tsx");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, code);

// Loading cho cac trang khac
const pages = ["requests", "approvals", "assets", "handovers", "purchase-orders", "admin/users"];
pages.forEach((page) => {
  const pageDir = path.join(__dirname, "src", "app", "(dashboard)", page);
  if (fs.existsSync(pageDir)) {
    const loadingFile = path.join(pageDir, "loading.tsx");
    if (!fs.existsSync(loadingFile)) {
      fs.writeFileSync(loadingFile, code);
      console.log("Created loading.tsx for", page);
    }
  }
});

console.log("Done");