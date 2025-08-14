import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer, { hydrate as hydratePreferences, loadPreferencesFromStorage } from './preferencesSlice';
import commentsReducer from './commentsSlice';

// Configure the Redux store with all available slices. In addition to
// the preferences slice, register the comments slice so that
// components like CommentsThread can interact with comment state. If
// you add more slices in the future, be sure to include them here.
export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    comments: commentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hydrate preferences from AsyncStorage on app start. This helper
// function loads persisted settings and applies them to the store. It
// accepts an optional callback to run after hydration completes.
export async function bootstrapPreferences(onApply?: (state: RootState) => void) {
  const saved = await loadPreferencesFromStorage();
  // Use the renamed hydratePreferences action so there is no name
  // collision with other slices that might also export a hydrate action.
  store.dispatch(hydratePreferences(saved));
  onApply?.(store.getState());
}