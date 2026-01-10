"use client";

import { useEffect, useState } from "react";
import { LucideMoon, LucideSun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light" as Theme;
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "light";
};

const applyTheme = (nextTheme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
};

export default function ThemeToggle({
  className,
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    window.localStorage.setItem("theme", initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <LucideSun className="h-4 w-4" />
      ) : (
        <LucideMoon className="h-4 w-4" />
      )}
      <span className="ml-2 text-xs">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </span>
    </Button>
  );
}
