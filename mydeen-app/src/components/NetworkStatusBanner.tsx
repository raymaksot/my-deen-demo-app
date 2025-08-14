import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    text: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8,
    },
    icon: {
      fontSize: 16,
    },
  });

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        Нет подключения к интернету
      </Text>
    </View>
  );
}