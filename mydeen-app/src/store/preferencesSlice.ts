import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { appStorage } from '@/utils/cache';

export type ThemeMode = 'light' | 'dark';
export type FontSize = 'small' | 'normal' | 'large';

export interface PrayerPreferences {
	calculationMethod: string; // e.g., 'MWL', 'ISNA', 'Makkah'
	highLatitudeRule: string; // 'MidNight', 'Seventh', 'AngleBased'
	timezone?: string;
}

export interface PreferencesState {
	themeMode: ThemeMode;
	locale: string;
	prayer: PrayerPreferences;
	fontScale: number; // 1.0 = normal, 1.2 = large, 0.8 = small
	highContrast: boolean;
}

const initialState: PreferencesState = {
	themeMode: 'light',
	locale: 'en',
	prayer: {
		calculationMethod: 'MWL',
		highLatitudeRule: 'MidNight',
	},
	fontScale: 1.0,
	highContrast: false,
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
		setPrayerPreferences(state, action: PayloadAction<PrayerPreferences>) {
			state.prayer = action.payload;
		},
		setFontScale(state, action: PayloadAction<number>) {
			state.fontScale = action.payload;
		},
		setHighContrast(state, action: PayloadAction<boolean>) {
			state.highContrast = action.payload;
		},
		hydrate(state, action: PayloadAction<Partial<PreferencesState>>) {
			return { ...state, ...action.payload };
		},
	},
});

export const { 
	setThemeMode, 
	setLocale, 
	setPrayerPreferences, 
	setFontScale, 
	setHighContrast, 
	hydrate 
} = preferencesSlice.actions;

// Persistence functions
export const loadPreferencesFromStorage = async (): Promise<Partial<PreferencesState>> => {
	try {
		const [themeMode, locale, prayer, fontScale, highContrast] = await Promise.all([
			appStorage.getString('prefs:themeMode'),
			appStorage.getString('prefs:locale'),
			appStorage.getObject<PrayerPreferences>('prefs:prayer'),
			appStorage.getString('prefs:fontScale'),
			appStorage.getString('prefs:highContrast'),
		]);

		const preferences: Partial<PreferencesState> = {};
		
		if (themeMode === 'light' || themeMode === 'dark') {
			preferences.themeMode = themeMode;
		}
		if (locale) {
			preferences.locale = locale;
		}
		if (prayer) {
			preferences.prayer = prayer;
		}
		if (fontScale) {
			const scale = Number(fontScale);
			if (!isNaN(scale) && scale > 0) {
				preferences.fontScale = scale;
			}
		}
		if (highContrast !== null) {
			preferences.highContrast = highContrast === '1';
		}

		return preferences;
	} catch (error) {
		console.warn('Failed to load preferences from storage:', error);
		return {};
	}
};

export const savePreferencesToStorage = async (preferences: PreferencesState): Promise<void> => {
	try {
		await Promise.all([
			appStorage.setString('prefs:themeMode', preferences.themeMode),
			appStorage.setString('prefs:locale', preferences.locale),
			appStorage.setObject('prefs:prayer', preferences.prayer),
			appStorage.setString('prefs:fontScale', String(preferences.fontScale)),
			appStorage.setString('prefs:highContrast', preferences.highContrast ? '1' : '0'),
		]);
	} catch (error) {
		console.warn('Failed to save preferences to storage:', error);
	}
};

export default preferencesSlice.reducer;