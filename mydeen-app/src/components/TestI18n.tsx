import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLocale } from '@/store/preferencesSlice';

/**
 * Simple test component to verify i18n functionality
 * This can be temporarily added to any screen for testing
 */
export default function TestI18n() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector((s) => s.preferences.locale);

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    dispatch(setLocale(newLocale));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('appName')}</Text>
      <Text style={styles.subtitle}>{t('hello')}</Text>
      <Text style={styles.info}>Current locale: {currentLocale}</Text>
      <Text style={styles.info}>i18n language: {i18n.language}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
        <Text style={styles.buttonText}>
          Switch to {currentLocale === 'en' ? 'العربية' : 'English'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#0E7490',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});