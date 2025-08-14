import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import EventDetailScreen from '@/screens/events/EventDetailScreen';
import * as apiService from '@/services/api';

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiDelete: jest.fn(),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
const mockApiPost = apiService.apiPost as jest.MockedFunction<typeof apiService.apiPost>;
const mockApiDelete = apiService.apiDelete as jest.MockedFunction<typeof apiService.apiDelete>;

const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;

const mockEventData = {
  _id: 'event-123',
  title: 'Test Event',
  startsAt: '2024-12-31T18:00:00Z',
  location: 'Test Location',
  description: 'Test Description',
  registrationsCount: 5,
};

describe('EventDetailScreen Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the route params
    mockUseRoute.mockReturnValue({
      params: { id: 'event-123' },
    } as any);

    // Mock the initial API call to get event details
    mockApiGet.mockResolvedValue(mockEventData);
  });

  test('should load event details and display RSVP button', async () => {
    const { getByText, getByTestId } = render(<EventDetailScreen />);

    // Wait for the event data to be loaded
    await waitFor(() => {
      expect(getByText('Test Event')).toBeTruthy();
      expect(getByText('Test Location')).toBeTruthy();
      expect(getByText('Test Description')).toBeTruthy();
      expect(getByText('Registrations: 5')).toBeTruthy();
    });

    // Verify API was called with correct endpoint
    expect(mockApiGet).toHaveBeenCalledWith('/api/events/event-123');

    // Check that RSVP button is displayed (not registered initially)
    expect(getByText('RSVP')).toBeTruthy();
  });

  test('should call apiPost when RSVP button is clicked and update state', async () => {
    // Mock the RSVP API response
    mockApiPost.mockResolvedValue({
      registered: true,
      registrationsCount: 6,
    });

    const { getByText } = render(<EventDetailScreen />);

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Test Event')).toBeTruthy();
    });

    // Find and click the RSVP button
    const rsvpButton = getByText('RSVP');
    fireEvent.press(rsvpButton);

    // Verify apiPost was called with correct parameters
    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/api/events/event-123/register');
    });

    // Verify state changes - button should change to "Cancel RSVP"
    await waitFor(() => {
      expect(getByText('Cancel RSVP')).toBeTruthy();
    });

    // Verify registration count was updated
    await waitFor(() => {
      expect(getByText('Registrations: 6')).toBeTruthy();
    });
  });

  test('should call apiDelete when Cancel RSVP button is clicked', async () => {
    // Mock initial registration state
    mockApiPost.mockResolvedValue({
      registered: true,
      registrationsCount: 6,
    });

    mockApiDelete.mockResolvedValue({
      registered: false,
      registrationsCount: 5,
    });

    const { getByText } = render(<EventDetailScreen />);

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Test Event')).toBeTruthy();
    });

    // First register
    const rsvpButton = getByText('RSVP');
    fireEvent.press(rsvpButton);

    // Wait for registration to complete
    await waitFor(() => {
      expect(getByText('Cancel RSVP')).toBeTruthy();
    });

    // Now cancel the registration
    const cancelButton = getByText('Cancel RSVP');
    fireEvent.press(cancelButton);

    // Verify apiDelete was called with correct parameters
    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith('/api/events/event-123/register');
    });

    // Verify state changes - button should change back to "RSVP"
    await waitFor(() => {
      expect(getByText('RSVP')).toBeTruthy();
    });

    // Verify registration count was updated
    await waitFor(() => {
      expect(getByText('Registrations: 5')).toBeTruthy();
    });
  });


  test('should schedule notification when registering for future event', async () => {
    const futureEventData = {
      ...mockEventData,
      startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    };

    mockApiGet.mockResolvedValue(futureEventData);
    mockApiPost.mockResolvedValue({
      registered: true,
      registrationsCount: 6,
    });

    // Import the module to access the mock
    const Notifications = require('expo-notifications');

    const { getByText } = render(<EventDetailScreen />);

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Test Event')).toBeTruthy();
    });

    // Click RSVP button
    const rsvpButton = getByText('RSVP');
    fireEvent.press(rsvpButton);

    // Verify notification was scheduled
    await waitFor(() => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });
});