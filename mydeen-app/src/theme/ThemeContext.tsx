import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from './theme';

export interface ThemeContextValue {
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
    muted: string;
  };
  fontScale: number;
  highContrast: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the current theme context. This provides colors,
 * font scale, and high contrast settings from the Redux store.
 * Must be used within a ThemeProvider.
 */
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Higher-order component that wraps a component with theme context
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const theme = useThemeContext();
    return <Component {...props} theme={theme} ref={ref} />;
  });
};