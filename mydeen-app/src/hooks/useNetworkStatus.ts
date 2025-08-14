import { useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { flushAll } from '@/offline/mutationQueue';

export interface NetworkState {
  isConnected: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    wasOffline: false,
  });
  const previouslyConnected = useRef<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const wasOffline = !previouslyConnected.current && isConnected;
      
      setNetworkState({
        isConnected,
        wasOffline,
      });

      // If connection was restored, flush offline mutations
      if (wasOffline) {
        console.log('Connection restored, flushing offline mutations...');
        flushAll().catch(error => {
          console.warn('Failed to flush offline mutations:', error);
        });
      }

      previouslyConnected.current = isConnected;
    });

    return unsubscribe;
  }, []);

  return networkState;
}