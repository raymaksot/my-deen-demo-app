import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer, { 
  setThemeMode, 
  setFontSize, 
  setHighContrast,
  PreferencesState 
} from '../preferencesSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
    },
  });
};

describe('preferencesSlice', () => {
  it('should handle initial state', () => {
    const store = createTestStore();
    const state = store.getState().preferences;
    
    expect(state.themeMode).toBe('light');
    expect(state.fontSize).toBe('medium');
    expect(state.highContrast).toBe(false);
    expect(state.locale).toBe('en');
  });

  it('should handle setFontSize', () => {
    const store = createTestStore();
    
    store.dispatch(setFontSize('large'));
    expect(store.getState().preferences.fontSize).toBe('large');
    
    store.dispatch(setFontSize('small'));
    expect(store.getState().preferences.fontSize).toBe('small');
  });

  it('should handle setHighContrast', () => {
    const store = createTestStore();
    
    store.dispatch(setHighContrast(true));
    expect(store.getState().preferences.highContrast).toBe(true);
    
    store.dispatch(setHighContrast(false));
    expect(store.getState().preferences.highContrast).toBe(false);
  });

  it('should handle setThemeMode', () => {
    const store = createTestStore();
    
    store.dispatch(setThemeMode('dark'));
    expect(store.getState().preferences.themeMode).toBe('dark');
    
    store.dispatch(setThemeMode('light'));
    expect(store.getState().preferences.themeMode).toBe('light');
  });
});