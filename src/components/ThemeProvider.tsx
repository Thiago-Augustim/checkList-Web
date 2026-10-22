"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "checklist_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        aplicarTemaNoDocumento(saved);
      } else {
        const prefereEscuro = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const inicial: Theme = prefereEscuro ? "dark" : "light";
        setThemeState(inicial);
        aplicarTemaNoDocumento(inicial);
      }
    } catch {
      // Ignora erro de acesso a localStorage
    } finally {
      setMounted(true);
    }
  }, []);

  const aplicarTemaNoDocumento = (novoTema: Theme) => {
    const root = document.documentElement;
    if (novoTema === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  };

  const setTheme = (novoTema: Theme) => {
    setThemeState(novoTema);
    aplicarTemaNoDocumento(novoTema);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, novoTema);
    } catch {
      // Ignora erro
    }
  };

  const toggleTheme = () => {
    const proximo = theme === "dark" ? "light" : "dark";
    setTheme(proximo);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro de um ThemeProvider");
  }
  return context;
}
