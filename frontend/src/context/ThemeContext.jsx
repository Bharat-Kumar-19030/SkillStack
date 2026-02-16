import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, checkAuth } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage on first render
    return localStorage.getItem('theme') || 'light';
  });
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync theme from user settings ONLY on initial load
  useEffect(() => {
    if (!hasInitialized) {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        // localStorage takes precedence (most recent user action)
        setTheme(savedTheme);
      } else if (user?.theme) {
        // Fall back to user's DB theme if no localStorage
        setTheme(user.theme);
        localStorage.setItem('theme', user.theme);
      }
      
      setHasInitialized(true);
    }
    setLoading(false);
  }, [user?.theme, hasInitialized]);

  // Apply theme to document
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Update theme immediately for instant UI response
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Save to database if user is logged in
    if (user) {
      try {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
        const response = await fetch(`${SERVER_URL}/api/users/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ theme: newTheme }),
        });

        if (response.ok) {
          // Refresh user context to sync the updated theme
          await checkAuth();
        } else {
          console.error('Failed to save theme to database');
        }
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
