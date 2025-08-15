import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from '../../store/preferencesSlice';
import SettingsScreen from '../SettingsScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock appStorage
jest.mock('../../../utils/cache', () => ({
  appStorage: {
    getObject: jest.fn().mockResolvedValue(null),
    setObject: jest.fn().mockResolvedValue(void 0),
    getString: jest.fn().mockResolvedValue(null),
    setString: jest.fn().mockResolvedValue(void 0),
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
    },
  });
};

describe('SettingsScreen', () => {
  it('should render without crashing', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>
    );
    
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('High Contrast')).toBeTruthy();
    expect(getByText('Font Size')).toBeTruthy();
  });

  it('should render font size options', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>
    );
    
    expect(getByText('Small')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('Large')).toBeTruthy();
  });

  it('should render notification settings', () => {
    const store = createTestStore();
    
    const { getByText } = render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>
    );
    
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Prayer Times')).toBeTruthy();
    expect(getByText('Events')).toBeTruthy();
    expect(getByText('Articles')).toBeTruthy();
    expect(getByText('Group Milestones')).toBeTruthy();
  });
});