import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import GroupDetailScreen from '../GroupDetailScreen';
import * as apiService from '@/services/api';
import { groupsService } from '@/services/groupsService';

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

// Mock the groupsService
jest.mock('@/services/groupsService', () => ({
  groupsService: {
    join: jest.fn(),
    leave: jest.fn(),
    setProgress: jest.fn(),
  },
}));

// Mock the store hooks
jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

// Mock the offline mutation queue
jest.mock('@/offline/mutationQueue', () => ({
  enqueue: jest.fn(),
}));

const mockApiGet = apiService.apiGet as jest.MockedFunction<typeof apiService.apiGet>;
const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>;
const mockGroupsServiceJoin = groupsService.join as jest.MockedFunction<typeof groupsService.join>;
const mockGroupsServiceLeave = groupsService.leave as jest.MockedFunction<typeof groupsService.leave>;

const mockUser = {
  sub: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
};

const mockGroupData = {
  group: {
    _id: 'group-123',
    name: 'Test Group',
    description: 'Test Description',
    createdBy: 'owner-456',
  },
  members: [
    { userId: 'owner-456', role: 'owner' as const },
    { userId: 'member-789', role: 'member' as const },
  ],
};

describe('GroupDetailScreen Join/Leave Functionality', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the route params
    mockUseRoute.mockReturnValue({
      params: { id: 'group-123' },
    } as any);

    // Mock the user selector
    mockUseAppSelector.mockReturnValue(mockUser);

    // Mock the API calls
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve([]);
      }
      if (url.includes('/messages')) {
        return Promise.resolve([]);
      }
      if (url.includes('/api/reading-groups/group-123')) {
        return Promise.resolve(mockGroupData);
      }
      return Promise.resolve({});
    });
  });

  test('should show Join button when user is not a member', async () => {
    const { getByText, queryByText } = render(<GroupDetailScreen />);

    // Wait for the group data to be loaded
    await waitFor(() => {
      expect(getByText('Test Group')).toBeTruthy();
    });

    // User is not a member, so Join button should be visible
    expect(getByText('Join')).toBeTruthy();
    // Leave button should not be visible
    expect(queryByText('Leave')).toBeNull();
  });

  test('should show Leave button when user is a member but not owner', async () => {
    // Add current user as a member
    const groupDataWithCurrentUser = {
      ...mockGroupData,
      members: [
        ...mockGroupData.members,
        { userId: 'user-123', role: 'member' as const },
      ],
    };

    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve([]);
      }
      if (url.includes('/messages')) {
        return Promise.resolve([]);
      }
      if (url.includes('/api/reading-groups/group-123')) {
        return Promise.resolve(groupDataWithCurrentUser);
      }
      return Promise.resolve({});
    });

    const { getByText, queryByText } = render(<GroupDetailScreen />);

    // Wait for the group data to be loaded
    await waitFor(() => {
      expect(getByText('Test Group')).toBeTruthy();
    });

    // User is a member but not owner, so Leave button should be visible
    expect(getByText('Leave')).toBeTruthy();
    // Join button should not be visible
    expect(queryByText('Join')).toBeNull();
  });

  test('should not show Join or Leave buttons when user is the owner', async () => {
    // Make current user the owner
    const groupDataWithOwner = {
      ...mockGroupData,
      members: [
        { userId: 'user-123', role: 'owner' as const },
        { userId: 'member-789', role: 'member' as const },
      ],
    };

    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve([]);
      }
      if (url.includes('/messages')) {
        return Promise.resolve([]);
      }
      if (url.includes('/api/reading-groups/group-123')) {
        return Promise.resolve(groupDataWithOwner);
      }
      return Promise.resolve({});
    });

    const { queryByText } = render(<GroupDetailScreen />);

    // Wait for the group data to be loaded
    await waitFor(() => {
      expect(queryByText('Test Group')).toBeTruthy();
    });

    // Owner should not see Join or Leave buttons
    expect(queryByText('Join')).toBeNull();
    expect(queryByText('Leave')).toBeNull();
  });

  test('should call groupsService.join and update members when Join button is pressed', async () => {
    mockGroupsServiceJoin.mockResolvedValue({ joined: true });

    const { getByText } = render(<GroupDetailScreen />);

    // Wait for the group data to be loaded
    await waitFor(() => {
      expect(getByText('Test Group')).toBeTruthy();
    });

    // Click the Join button
    const joinButton = getByText('Join');
    fireEvent.press(joinButton);

    // Verify groupsService.join was called
    await waitFor(() => {
      expect(mockGroupsServiceJoin).toHaveBeenCalledWith('group-123');
    });

    // After joining, Join button should disappear and Leave button should appear
    await waitFor(() => {
      expect(getByText('Leave')).toBeTruthy();
    });
  });

  test('should call groupsService.leave and update members when Leave button is pressed', async () => {
    // Start with user as a member
    const groupDataWithCurrentUser = {
      ...mockGroupData,
      members: [
        ...mockGroupData.members,
        { userId: 'user-123', role: 'member' as const },
      ],
    };

    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve([]);
      }
      if (url.includes('/messages')) {
        return Promise.resolve([]);
      }
      if (url.includes('/api/reading-groups/group-123')) {
        return Promise.resolve(groupDataWithCurrentUser);
      }
      return Promise.resolve({});
    });

    mockGroupsServiceLeave.mockResolvedValue({ left: true });

    const { getByText } = render(<GroupDetailScreen />);

    // Wait for the group data to be loaded
    await waitFor(() => {
      expect(getByText('Test Group')).toBeTruthy();
    });

    // Click the Leave button
    const leaveButton = getByText('Leave');
    fireEvent.press(leaveButton);

    // Verify groupsService.leave was called
    await waitFor(() => {
      expect(mockGroupsServiceLeave).toHaveBeenCalledWith('group-123');
    });

    // After leaving, Leave button should disappear and Join button should appear
    await waitFor(() => {
      expect(getByText('Join')).toBeTruthy();
    });
  });
});