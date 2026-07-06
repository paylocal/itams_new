const fs = require("fs");
const path = require("path");

// Them vao providers
const providersFile = path.join(__dirname, "src", "components", "providers.tsx");
let providers = fs.readFileSync(providersFile, "utf-8");

if (!providers.includes("ThemeProvider")) {
  providers = providers.replace(
    "import { SessionProvider } from \"next-auth/react\";",
    "import { SessionProvider } from \"next-auth/react\";\nimport { ThemeProvider } from \"./theme-provider\";"
  );
  providers = providers.replace(
    "<SessionProvider>",
    "<SessionProvider>\n      <ThemeProvider>"
  );
  providers = providers.replace(
    "</SessionProvider>",
    "</ThemeProvider>\n    </SessionProvider>"
  );
  fs.writeFileSync(providersFile, providers);
  console.log("Updated providers.tsx");
}

// Them toggle vao header
const headerFile = path.join(__dirname, "src", "components", "layout", "header.tsx");
let header = fs.readFileSync(headerFile, "utf-8");

if (!header.includes("ThemeToggle")) {
  header = header.replace(
    "import { signOut } from \"next-auth/react\";\nimport { LogOut, Globe, ChevronDown } from \"lucide-react\";",
    "import { signOut } from \"next-auth/react\";\nimport { LogOut, Globe, ChevronDown } from \"lucide-react\";\nimport { ThemeToggle } from \"../theme-toggle\";"
  );
  // Them ThemeToggle truoc LanguageSwitcher
  header = header.replace(
    "/* Language Switcher */",
    "{/* Theme Toggle */}\n        <ThemeToggle />\n\n        {/* Language Switcher */}"
  );
  fs.writeFileSync(headerFile, header);
  console.log("Updated header.tsx");
}