const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "components", "providers.tsx");
const code = `"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "./i18n-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
`;

fs.writeFileSync(file, code);
console.log("Updated providers");