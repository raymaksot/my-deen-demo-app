# NetInfo Integration

This implementation adds network connectivity monitoring to the MyDeen app with automatic offline synchronization.

## Features

1. **Network Status Monitoring**: Uses `@react-native-community/netinfo` to monitor internet connectivity
2. **Offline Notification**: Shows a red banner when the device is offline
3. **Automatic Sync**: Automatically calls `flushAll()` when internet connection is restored

## Components

### `useNetworkStatus` Hook

Located in `src/hooks/useNetworkStatus.ts`

- Monitors network connectivity status
- Tracks connection state changes
- Automatically triggers `flushAll()` when connection is restored
- Returns `{ isConnected: boolean, wasOffline: boolean }`

### `NetworkStatusBanner` Component

Located in `src/components/NetworkStatusBanner.tsx`

- Displays a red banner at the top of the app when offline
- Shows Russian text: "Нет подключения к интернету" (No internet connection)
- Automatically hides when connection is restored

## Integration

The components are integrated in `App.tsx`:

1. `NetworkStatusBanner` is added above the main navigator
2. The banner appears/disappears automatically based on network state
3. When connectivity is restored, offline mutations are automatically sent to the server

## Testing

To test the offline functionality:

1. Turn off device network/WiFi
2. Notice the red banner appears
3. Use app features that create mutations (comments, group progress, etc.)
4. Turn network back on
5. Check console logs for "Connection restored, flushing offline mutations..."
6. Verify that queued mutations are sent to the server

## Dependencies

- `@react-native-community/netinfo` - Network status monitoring
- Existing offline mutation queue system (`src/offline/mutationQueue.ts`)