import { FontSize } from '@/store/preferencesSlice';

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

// High contrast variants
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

// Font size multipliers
export const fontSizeMultipliers: Record<FontSize, number> = {
	small: 0.85,
	medium: 1.0,
	large: 1.2,
};