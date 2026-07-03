const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "app", "globals.css");
let content = fs.readFileSync(file, "utf-8");

if (!content.includes(".dark {")) {
  const darkCSS = `

/* Dark mode */
.dark { color-scheme: dark; }
.dark body { background: #0f172a; color: #e2e8f0; }
.dark .bg-white { background: #1e293b; color: #e2e8f0; }
.dark .bg-gray-50 { background: #0f172a; }
.dark .bg-gray-100 { background: #334155; }
.dark .text-gray-500 { color: #94a3b8; }
.dark .text-gray-600 { color: #cbd5e1; }
.dark .text-gray-700 { color: #e2e8f0; }
.dark .text-gray-800 { color: #f1f5f9; }
.dark .border-gray-200 { border-color: #334155; }
.dark .border-r { border-color: #334155; }
.dark .border { border-color: #334155; }
.dark .border-b { border-color: #334155; }
.dark .border-t { border-color: #334155; }
.dark .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5); }
.dark .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
.dark input, .dark textarea, .dark select {
  background: #1e293b; color: #e2e8f0; border-color: #334155;
}
.dark .hover\\:bg-gray-50:hover { background: #1e293b; }
.dark .hover\\:bg-gray-100:hover { background: #334155; }
.dark .hover\\:bg-red-50:hover { background: #7f1d1d; }
.dark .hover\\:bg-blue-50:hover { background: #1e3a8a; }
.dark .hover\\:bg-blue-100:hover { background: #1e40af; }
.dark .hover\\:bg-green-50:hover { background: #14532d; }
.dark .hover\\:bg-yellow-50:hover { background: #713f12; }
.dark .hover\\:bg-purple-50:hover { background: #581c87; }
.dark .hover\\:bg-purple-100:hover { background: #6b21a8; }
.dark .bg-blue-50 { background: #1e3a8a; }
.dark .bg-blue-100 { background: #1e40af; }
.dark .bg-green-100 { background: #14532d; }
.dark .bg-green-50 { background: #14532d; }
.dark .bg-yellow-100 { background: #713f12; }
.dark .bg-yellow-50 { background: #713f12; }
.dark .bg-orange-100 { background: #7c2d12; }
.dark .bg-purple-100 { background: #581c87; }
.dark .bg-pink-100 { background: #831843; }
.dark .bg-red-50 { background: #7f1d1d; }
.dark .bg-red-100 { background: #7f1d1d; }
.dark .bg-cyan-100 { background: #155e75; }
.dark .bg-indigo-100 { background: #312e81; }
.dark .text-blue-700 { color: #93c5fd; }
.dark .text-green-700 { color: #86efac; }
.dark .text-yellow-700 { color: #fde047; }
.dark .text-orange-700 { color: #fdba74; }
.dark .text-red-700 { color: #fca5a5; }
.dark .text-purple-700 { color: #d8b4fe; }
.dark .bg-gray-200 { background: #475569; }
`;
  content = content + darkCSS;
  fs.writeFileSync(file, content);
  console.log("Added dark mode CSS");
}