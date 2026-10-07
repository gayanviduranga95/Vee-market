"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "vee-market-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setThemeState(prefersDark ? "dark" : "light");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  function setTheme(theme: Theme) {
    setThemeState(theme);
  }

  function toggleTheme() {
    setThemeState((current) =>
      current === "light" ? "dark" : "light"
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}