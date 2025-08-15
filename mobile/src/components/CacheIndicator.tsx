import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CacheIndicatorProps {
  isFromCache: boolean;
  isStale?: boolean;
  style?: any;
}

export const CacheIndicator: React.FC<CacheIndicatorProps> = ({ 
  isFromCache, 
  isStale = false, 
  style 
}) => {
  if (!isFromCache) return null;
  
  return (
    <View style={[styles.container, isStale && styles.staleContainer, style]}>
      <Text style={[styles.text, isStale && styles.staleText]}>
        {isStale 
          ? 'Данные могут быть устаревшими (оффлайн)'
          : 'Данные из кэша'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff',
    borderColor: '#4a90e2',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 4,
  },
  staleContainer: {
    backgroundColor: '#fff8f0',
    borderColor: '#e2a04a',
  },
  text: {
    fontSize: 12,
    color: '#4a90e2',
    textAlign: 'center',
  },
  staleText: {
    color: '#e2a04a',
  },
});