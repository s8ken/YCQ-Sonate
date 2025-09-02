"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"

interface ThemeContextType {
  mode: "light" | "dark"
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as "light" | "dark"
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("themeMode", mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#2563eb" : "#3b82f6",
        light: mode === "light" ? "#60a5fa" : "#93c5fd",
        dark: mode === "light" ? "#1d4ed8" : "#1e40af",
        contrastText: "#ffffff",
      },
      secondary: {
        main: mode === "light" ? "#7c3aed" : "#8b5cf6",
        light: mode === "light" ? "#a78bfa" : "#c4b5fd",
        dark: mode === "light" ? "#5b21b6" : "#6d28d9",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "light" ? "#f8fafc" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
      text: {
        primary: mode === "light" ? "#1e293b" : "#f1f5f9",
        secondary: mode === "light" ? "#64748b" : "#94a3b8",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === "light" ? "0 1px 3px rgba(0, 0, 0, 0.05)" : "0 4px 6px rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
  })

  const value: ThemeContextType = {
    mode,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
