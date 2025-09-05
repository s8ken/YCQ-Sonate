import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

// Create a context for the theme
export const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Robocoder.ai inspired clean white theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#6c757d',
      light: '#adb5bd',
      dark: '#495057',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6c757d',
    },
    divider: '#e9ecef',
    // Icon colors for small pops of color
    info: {
      main: '#0ea5e9', // Blue for info icons
    },
    success: {
      main: '#10b981', // Green for success icons
    },
    warning: {
      main: '#f59e0b', // Orange for warning icons
    },
    error: {
      main: '#ef4444', // Red for error icons
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#1a1a1a',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#1a1a1a',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#1a1a1a',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1a1a1a',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6c757d',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
        },
        contained: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#333333',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderColor: '#e9ecef',
          color: '#1a1a1a',
          '&:hover': {
            borderColor: '#1a1a1a',
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e9ecef',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Proper dark theme implementation
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
      light: '#f5f5f5',
      dark: '#e0e0e0',
    },
    secondary: {
      main: '#9ca3af',
      light: '#d1d5db',
      dark: '#6b7280',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
    },
    divider: '#374151',
    // Icon colors for small pops of color
    info: {
      main: '#60a5fa', // Blue for info icons
    },
    success: {
      main: '#34d399', // Green for success icons
    },
    warning: {
      main: '#fbbf24', // Orange for warning icons
    },
    error: {
      main: '#f87171', // Red for error icons
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#ffffff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#ffffff',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#9ca3af',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
        },
        contained: {
          backgroundColor: '#ffffff',
          color: '#0f0f0f',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)',
          },
        },
        outlined: {
          borderColor: '#374151',
          color: '#ffffff',
          '&:hover': {
            borderColor: '#ffffff',
            backgroundColor: '#1a1a1a',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1a1a1a',
          border: '1px solid #374151',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #374151',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #374151',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('theme-mode') : null;
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme-mode', mode);
      }
    } catch {}
  }, [mode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', mode);
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
