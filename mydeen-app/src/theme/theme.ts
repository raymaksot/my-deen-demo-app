import { useAppSelector } from '@/store/hooks';
import { 
  lightTheme, 
  darkTheme, 
  lightHighContrastTheme, 
  darkHighContrastTheme, 
  fontSizeMultipliers 
} from './constants';

/**
 * Hook to return the current color palette based on the user's
 * themeMode preference. This hook reads the `themeMode` value
 * from the Redux preferences slice and returns either the light
 * or dark theme colours accordingly. Components can call this
 * hook at render time to derive dynamic colours instead of
 * hard‑coding values. Because it relies on a React hook from
 * the store it must only be invoked within a React component.
 */
export const useThemeColors = () => {
  // Retrieve the current theme mode ('light' | 'dark') from
  // the Redux preferences state. If no preference is set,
  // default to light mode.
  const themeMode = useAppSelector((s) => s.preferences.themeMode);
  const highContrast = useAppSelector((s) => s.preferences.highContrast);
  
  if (highContrast) {
    return themeMode === 'dark' ? darkHighContrastTheme.colors : lightHighContrastTheme.colors;
  }
  
  return themeMode === 'dark' ? darkTheme.colors : lightTheme.colors;
};

/**
 * Hook to return the current font size multiplier based on user preferences
 */
export const useFontSize = () => {
  const fontSize = useAppSelector((s) => s.preferences.fontSize);
  return fontSizeMultipliers[fontSize];
};

/**
 * Combined hook that returns both colors and font size multiplier
 */
export const useThemeConfig = () => {
  const colors = useThemeColors();
  const fontMultiplier = useFontSize();
  
  return { colors, fontMultiplier };
};

// Re-export constants for convenience
export { 
  lightTheme, 
  darkTheme, 
  lightHighContrastTheme, 
  darkHighContrastTheme, 
  fontSizeMultipliers 
};