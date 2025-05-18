
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "stickycanvas-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme); // Initialize with defaultTheme

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    let storedThemeValue: Theme | null = null;
    try {
      storedThemeValue = window.localStorage.getItem(storageKey) as Theme | null;
    } catch (e) {
      console.error("Error reading theme from localStorage", e);
    }

    if (storedThemeValue && storedThemeValue !== defaultTheme) {
      setThemeState(storedThemeValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    // This effect applies the theme class and saves to localStorage whenever the theme state changes
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.error("Error saving theme to localStorage", e);
    }
  }, [theme, storageKey]);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
