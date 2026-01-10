"use client";

import { useSyncExternalStore } from "react";
import { LucideMoon, LucideSun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";
const THEME_STORAGE_KEY = "theme";

const applyTheme = (nextTheme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
};

const getThemeSnapshot = (): Theme => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (error) {
    // no-op
  }
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const getServerSnapshot = (): Theme => "light";

const subscribeToTheme = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      const nextTheme =
        event.newValue === "dark" || event.newValue === "light"
          ? (event.newValue as Theme)
          : "light";
      applyTheme(nextTheme);
      callback();
    }
  };
  const handleThemeChange = () => {
    const nextTheme = getThemeSnapshot();
    applyTheme(nextTheme);
    callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("theme-change", handleThemeChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("theme-change", handleThemeChange);
  };
};

export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("theme-change"));
    }
  };

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
