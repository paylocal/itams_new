const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/components/layout/header.tsx");
let code = fs.readFileSync(file, "utf-8");

// Thay doi cach set locale: Save localStorage TRUOC, sau do update state, sau do reload
code = code.replace(
  /setLocale\(l\.code\);\s*setShowLang\(false\);\s*window\.location\.reload\(\);/g,
  `setLocale(l.code); setShowLang(false);`
);

// Them useEffect reload khi locale thay doi
if (!code.includes("useEffect(() => { if (locale && hasMounted)")) {
  const newEffect = `useEffect(() => {
    if (typeof window === "undefined") return;
    if (locale && hasMounted) {
      // Reload chi khi nguoi dung chon (khong phai lan dau load)
      const isInitial = (window as any).__i18n_initialized;
      if (isInitial) {
        window.location.reload();
      } else {
        (window as any).__i18n_initialized = true;
      }
    }
  }, [locale]);`;

  // Insert vao sau useState cua hasMounted
  if (code.includes("useState(false)")) {
    code = code.replace(
      "const [showLang, setShowLang] = useState(false);",
      "const [showLang, setShowLang] = useState(false);\n  const [hasMounted, setHasMounted] = useState(false);\n  " + newEffect
    );
  }
  
  // Them setHasMounted sau khi mount
  if (!code.includes("setHasMounted(true)")) {
    // Them vao useEffect load languages
    code = code.replace(
      ".then((data) => {",
      ".then((data) => { setHasMounted(true);"
    );
  }
}

fs.writeFileSync(file, code);
console.log("Updated header with delayed reload");