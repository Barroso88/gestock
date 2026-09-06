"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    accentSecondary: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "homebox",
    name: "HomeBox Original",
    description: "Ameixa escuro profundo, âmbar e detalhes teal",
    preview: {
      bg: "#151016",
      card: "#1e1723",
      accent: "#f59e0b",
      accentSecondary: "#2dd4bf",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Preto espacial de alto contraste, ciano e magenta néon",
    preview: {
      bg: "#08080d",
      card: "#12111d",
      accent: "#ff007f",
      accentSecondary: "#00f0ff",
    },
  },
  {
    id: "nordic",
    name: "Nordic Frost",
    description: "Azul-ardósia polar escandinavo e azul glacial ártico",
    preview: {
      bg: "#242933",
      card: "#2e3440",
      accent: "#88c0d0",
      accentSecondary: "#8fbcbb",
    },
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Verde esmeralda florestal e menta luminescente",
    preview: {
      bg: "#06120b",
      card: "#0c2417",
      accent: "#10b981",
      accentSecondary: "#34d399",
    },
  },
  {
    id: "sunset",
    name: "Sunset Terracotta",
    description: "Café expresso, cobre vulcânico e pôr-do-sol dourado",
    preview: {
      bg: "#170d0a",
      card: "#291711",
      accent: "#ea580c",
      accentSecondary: "#fb923c",
    },
  },
  {
    id: "sapphire",
    name: "Midnight Sapphire",
    description: "Azul-marinho abissal, ardósia real e safira elétrica",
    preview: {
      bg: "#060b14",
      card: "#0e172a",
      accent: "#0284c7",
      accentSecondary: "#38bdf8",
    },
  },
  {
    id: "synthwave",
    name: "Tokyo Synthwave",
    description: "Roxo cosmos retro wave 80s e rosa choque néon",
    preview: {
      bg: "#120721",
      card: "#220e3e",
      accent: "#f43f5e",
      accentSecondary: "#f472b6",
    },
  },
  {
    id: "monochrome",
    name: "Stealth Titanium",
    description: "Preto grafite absoluto, titânio escuro e prata pura",
    preview: {
      bg: "#0a0a0a",
      card: "#181818",
      accent: "#e4e4e7",
      accentSecondary: "#a1a1aa",
    },
  },
  {
    id: "light",
    name: "Clean Slate Light",
    description: "Modo claro minimalista, porcelana fresca e branco puro",
    preview: {
      bg: "#f1f5f9",
      card: "#ffffff",
      accent: "#d97706",
      accentSecondary: "#0284c7",
    },
  },
  {
    id: "cargo",
    name: "Industrial Cargo",
    description: "Cinza betão e asfalto com amarelo de segurança industrial",
    preview: {
      bg: "#141619",
      card: "#22262b",
      accent: "#eab308",
      accentSecondary: "#fde047",
    },
  },
];

interface ThemeContextValue {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<string>("homebox");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("gestock-theme");
      if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        setCurrentThemeState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", "homebox");
      }
    } catch {
      // Fallback in case localStorage is restricted
      document.documentElement.setAttribute("data-theme", "homebox");
    }
  }, []);

  const setTheme = (themeId: string) => {
    setCurrentThemeState(themeId);
    try {
      localStorage.setItem("gestock-theme", themeId);
      document.documentElement.setAttribute("data-theme", themeId);
    } catch {}
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
