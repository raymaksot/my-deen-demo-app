import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface PrayerPreferences {
	calculationMethod: string; // e.g., 'MWL', 'ISNA', 'Makkah'
	highLatitudeRule: string; // 'MidNight', 'Seventh', 'AngleBased'
	timezone?: string;
}

export interface PreferencesState {
	themeMode: ThemeMode;
	locale: string;
	prayer: PrayerPreferences;
}

const initialState: PreferencesState = {
	themeMode: 'light',
	locale: 'en',
	prayer: {
		calculationMethod: 'MWL',
		highLatitudeRule: 'MidNight',
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
		setPrayerPreferences(state, action: PayloadAction<PrayerPreferences>) {
			state.prayer = action.payload;
		},
		hydrate(state, action: PayloadAction<Partial<PreferencesState>>) {
			return { ...state, ...action.payload };
		},
	},
});

export const { setThemeMode, setLocale, setPrayerPreferences, hydrate } = preferencesSlice.actions;

// Storage persistence functions
const STORAGE_KEY = 'preferences';

export async function loadPreferencesFromStorage(): Promise<Partial<PreferencesState>> {
	try {
		const saved = await AsyncStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : {};
	} catch (error) {
		console.error('Failed to load preferences from storage:', error);
		return {};
	}
}

export async function savePreferencesToStorage(preferences: PreferencesState): Promise<void> {
	try {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
	} catch (error) {
		console.error('Failed to save preferences to storage:', error);
	}
}

export default preferencesSlice.reducer;