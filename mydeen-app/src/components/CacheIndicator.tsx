import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Note: useTranslation may need to be imported based on the actual i18n setup
// import { useTranslation } from 'react-i18next';

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
  // const { t } = useTranslation(); // Uncomment when i18n is properly configured
  
  if (!isFromCache) return null;
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, isStale && styles.staleText]}>
        {isStale 
          ? 'Данные могут быть устаревшими (оффлайн)' // t('cache.staleIndicator', 'Данные могут быть устаревшими (оффлайн)')
          : 'Данные из кэша' // t('cache.indicator', 'Данные из кэша')
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
  text: {
    fontSize: 12,
    color: '#4a90e2',
    textAlign: 'center',
  },
  staleText: {
    color: '#e2a04a',
    backgroundColor: '#fff8f0',
  },
});