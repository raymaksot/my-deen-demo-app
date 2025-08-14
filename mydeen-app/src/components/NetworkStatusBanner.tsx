import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatusBanner() {
  const networkState = useNetworkStatus();
  const colors = useThemeColors();

  if (networkState.isConnected) {
    return null;
  }

  const styles = StyleSheet.create({
    banner: {
      backgroundColor: '#ef4444', // red-500
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        📡 Нет подключения к интернету
      </Text>
    </View>
  );
}