import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer, { hydrate, loadPreferencesFromStorage, savePreferencesToStorage } from './preferencesSlice';
import commentsReducer from './commentsSlice';
import authReducer from './authSlice';

// Middleware to auto-save preferences
const preferencesMiddleware = (store: any) => (next: any) => (action: any) => {
	const result = next(action);
	
	// Save preferences to storage when they change
	if (action.type?.startsWith('preferences/') && action.type !== 'preferences/hydrate') {
		const state = store.getState();
		savePreferencesToStorage(state.preferences);
	}
	
	return result;
};

export const store = configureStore({
	reducer: {
		auth: authReducer,
		preferences: preferencesReducer,
		comments: commentsReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(preferencesMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export async function bootstrapPreferences(onApply?: (state: RootState) => void) {
	const saved = await loadPreferencesFromStorage();
	store.dispatch(hydrate(saved));
	onApply?.(store.getState());
}