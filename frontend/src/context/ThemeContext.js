import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export { ThemeContext };
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  // Set initial theme attribute on mount
  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#2563eb' : '#3b82f6',
        light: mode === 'light' ? '#60a5fa' : '#93c5fd',
        dark: mode === 'light' ? '#1d4ed8' : '#1e40af',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? '#7c3aed' : '#8b5cf6',
        light: mode === 'light' ? '#a78bfa' : '#c4b5fd',
        dark: mode === 'light' ? '#5b21b6' : '#6d28d9',
        contrastText: '#ffffff',
      },
      success: {
        main: mode === 'light' ? '#059669' : '#10b981',
        light: mode === 'light' ? '#34d399' : '#6ee7b7',
        dark: mode === 'light' ? '#047857' : '#065f46',
      },
      warning: {
        main: mode === 'light' ? '#d97706' : '#f59e0b',
        light: mode === 'light' ? '#fbbf24' : '#fcd34d',
        dark: mode === 'light' ? '#b45309' : '#92400e',
      },
      error: {
        main: mode === 'light' ? '#dc2626' : '#ef4444',
        light: mode === 'light' ? '#f87171' : '#fca5a5',
        dark: mode === 'light' ? '#b91c1c' : '#991b1b',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#0f172a',
        paper: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      },
      divider: mode === 'light' ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'light'
                ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                : '0 4px 12px rgba(59, 130, 246, 0.25)',
            },
          },
          contained: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light'
                ? '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)'
                : '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'light' ? '#2563eb' : '#3b82f6',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                  borderColor: mode === 'light' ? '#2563eb' : '#3b82f6',
                },
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0, 0, 0, 0.05)'
              : '0 4px 6px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'light'
              ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
              : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            borderRight: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
          },
        },
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
