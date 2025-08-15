import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

export interface PrayerPreferences {
	calculationMethod: string; // e.g., 'MWL', 'ISNA', 'Makkah'
	highLatitudeRule: string; // 'MidNight', 'Seventh', 'AngleBased'
	timezone?: string;
	notifications: {
		fajr: boolean;
		dhuhr: boolean;
		asr: boolean;
		maghrib: boolean;
		isha: boolean;
	};
}

export interface PreferencesState {
	themeMode: ThemeMode;
	locale: string;
	fontSize: FontSize;
	highContrast: boolean;
	prayer: PrayerPreferences;
}

const initialState: PreferencesState = {
	themeMode: 'light',
	locale: 'en',
	fontSize: 'medium',
	highContrast: false,
	prayer: {
		calculationMethod: 'MWL',
		highLatitudeRule: 'MidNight',
		notifications: {
			fajr: true,
			dhuhr: true,
			asr: true,
			maghrib: true,
			isha: true,
		},
	},
};

const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		setThemeMode(state, action: PayloadAction<ThemeMode>) {
			state.themeMode = action.payload;
		},
		setLocale(state, action: PayloadAction<string>) {
			state.locale = action.payload;
		},
		setFontSize(state, action: PayloadAction<FontSize>) {
			state.fontSize = action.payload;
		},
		setHighContrast(state, action: PayloadAction<boolean>) {
			state.highContrast = action.payload;
		},
		setPrayerPreferences(state, action: PayloadAction<PrayerPreferences>) {
			state.prayer = action.payload;
		},
	},
});

export const { setThemeMode, setLocale, setFontSize, setHighContrast, setPrayerPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;