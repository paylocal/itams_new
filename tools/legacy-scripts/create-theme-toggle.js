const fs = require("fs");
const path = require("path");

const code = `"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  if (!mounted) {
    return (
      <button className="p-2 rounded-md hover:bg-gray-100">
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      title={theme === "light" ? "Chuyen sang dark mode" : "Chuyen sang light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-600" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}
`;

const file = path.join(__dirname, "src", "components", "theme-toggle.tsx");
fs.writeFileSync(file, code);
console.log("Created:", file);