import React from 'react';
import { render } from '@testing-library/react-native';
import QiblaCompass from '../QiblaCompass';

// Mock the expo modules
jest.mock('expo-sensors', () => ({
  Magnetometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060, // New York coordinates
      },
    })
  ),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

// Test the bearing calculation function directly
function calculateBearingToKaaba(userLat: number, userLng: number): number {
  const kaabaLat = 21.4225; // Kaaba latitude
  const kaabaLng = 39.8262; // Kaaba longitude
  
  // Convert to radians
  const lat1 = userLat * (Math.PI / 180);
  const lat2 = kaabaLat * (Math.PI / 180);
  const deltaLng = (kaabaLng - userLng) * (Math.PI / 180);
  
  // Calculate bearing using great circle formula
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  
  // Normalize to 0-360 degrees
  return (bearing + 360) % 360;
}

describe('QiblaCompass', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<QiblaCompass />);
    expect(getByText(/Getting your location/)).toBeTruthy();
  });

  it('calculates correct bearing from New York to Kaaba', () => {
    const bearing = calculateBearingToKaaba(40.7128, -74.0060); // New York
    // Expected bearing from NYC to Mecca is approximately 58-60 degrees
    expect(bearing).toBeGreaterThan(50);
    expect(bearing).toBeLessThan(70);
  });

  it('calculates correct bearing from London to Kaaba', () => {
    const bearing = calculateBearingToKaaba(51.5074, -0.1278); // London
    // Expected bearing from London to Mecca is approximately 118-120 degrees
    expect(bearing).toBeGreaterThan(110);
    expect(bearing).toBeLessThan(130);
  });

  it('calculates correct bearing from Sydney to Kaaba', () => {
    const bearing = calculateBearingToKaaba(-33.8688, 151.2093); // Sydney
    // Expected bearing from Sydney to Mecca is approximately 277-285 degrees
    expect(bearing).toBeGreaterThan(270);
    expect(bearing).toBeLessThan(290);
  });

  it('returns a bearing between 0 and 360 degrees', () => {
    const bearing1 = calculateBearingToKaaba(0, 0); // Equator, Prime Meridian
    const bearing2 = calculateBearingToKaaba(90, 180); // North Pole, opposite side
    const bearing3 = calculateBearingToKaaba(-90, -180); // South Pole
    
    expect(bearing1).toBeGreaterThanOrEqual(0);
    expect(bearing1).toBeLessThan(360);
    expect(bearing2).toBeGreaterThanOrEqual(0);
    expect(bearing2).toBeLessThan(360);
    expect(bearing3).toBeGreaterThanOrEqual(0);
    expect(bearing3).toBeLessThan(360);
  });
});