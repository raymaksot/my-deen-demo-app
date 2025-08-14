export const lightTheme = {
	colors: {
		background: '#FFFFFF',
		text: '#111111',
		primary: '#0E7490',
		card: '#F5F7FA',
		border: '#E5E7EB',
		muted: '#6B7280',
	},
};

export const darkTheme = {
	colors: {
		background: '#0B1220',
		text: '#F3F4F6',
		primary: '#22D3EE',
		card: '#111827',
		border: '#1F2937',
		muted: '#9CA3AF',
	},
};

export const lightHighContrastTheme = {
	colors: {
		background: '#FFFFFF',
		text: '#000000',
		primary: '#0066CC',
		card: '#F0F0F0',
		border: '#000000',
		muted: '#333333',
	},
};

export const darkHighContrastTheme = {
	colors: {
		background: '#000000',
		text: '#FFFFFF',
		primary: '#66CCFF',
		card: '#1A1A1A',
		border: '#FFFFFF',
		muted: '#CCCCCC',
	},
};

/**
 * Hook to return the current color palette based on the user's
 * themeMode preference. This hook reads the `themeMode` value
 * from the Redux preferences slice and returns either the light
 * or dark theme colours accordingly. Components can call this
 * hook at render time to derive dynamic colours instead of
 * hard‑coding values. Because it relies on a React hook from
 * the store it must only be invoked within a React component.
 */
import { useAppSelector } from '@/store/hooks';

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
 * Hook to return the current font scale based on the user's
 * fontScale preference from the Redux preferences slice.
 */
export const useFontScale = () => {
  return useAppSelector((s) => s.preferences.fontScale);
};

/**
 * Hook to return both theme colors and font scale for convenience
 */
export const useTheme = () => {
  const colors = useThemeColors();
  const fontScale = useFontScale();
  const highContrast = useAppSelector((s) => s.preferences.highContrast);
  
  return {
    colors,
    fontScale,
    highContrast,
  };
};