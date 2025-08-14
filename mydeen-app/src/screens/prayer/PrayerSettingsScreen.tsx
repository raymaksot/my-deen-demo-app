import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setPrayerPreferences, PrayerPreferences } from '@/store/preferencesSlice';
import { schedulePrayerNotifications } from '@/services/athan';
import * as Location from 'expo-location';
import { prayerService } from '@/services/prayerService';

// Available calculation methods
const CALCULATION_METHODS = [
  { key: 'MWL', label: 'Muslim World League' },
  { key: 'ISNA', label: 'Islamic Society of North America' },
  { key: 'Makkah', label: 'Umm al-Qura, Makkah' },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'Dubai', label: 'Dubai' },
  { key: 'Kuwait', label: 'Kuwait' },
  { key: 'Qatar', label: 'Qatar' },
  { key: 'Singapore', label: 'Singapore' },
  { key: 'Turkey', label: 'Turkey' },
];

// Available high latitude rules
const HIGH_LATITUDE_RULES = [
  { key: 'MidNight', label: 'Middle of the Night' },
  { key: 'Seventh', label: 'One Seventh of the Night' },
  { key: 'AngleBased', label: 'Angle Based Method' },
];

export default function PrayerSettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const currentPreferences = useAppSelector((s) => s.preferences.prayer);
  
  const [preferences, setPreferences] = useState<PrayerPreferences>(currentPreferences);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update preferences in Redux store
      dispatch(setPrayerPreferences(preferences));
      
      // Get current location and prayer times to reschedule notifications
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const today = new Date();
        const prayerTimes = await prayerService.getMonthTimes(
          location.coords.latitude,
          location.coords.longitude,
          today.getMonth() + 1,
          today.getFullYear(),
          preferences.calculationMethod
        );
        
        // Get today's prayer times
        const todayTimes = prayerTimes[today.getDate() - 1];
        if (todayTimes) {
          await schedulePrayerNotifications(todayTimes, preferences.notifications);
        }
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save prayer settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (prayer: keyof typeof preferences.notifications) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [prayer]: !prev.notifications[prayer],
      },
    }));
  };

  const renderCalculationMethodSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Calculation Method</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {CALCULATION_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.optionButton,
              preferences.calculationMethod === method.key && styles.optionButtonSelected,
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, calculationMethod: method.key }))}
          >
            <Text style={[
              styles.optionText,
              preferences.calculationMethod === method.key && styles.optionTextSelected,
            ]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHighLatitudeRuleSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>High Latitude Rule</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {HIGH_LATITUDE_RULES.map((rule) => (
          <TouchableOpacity
            key={rule.key}
            style={[
              styles.optionButton,
              preferences.highLatitudeRule === rule.key && styles.optionButtonSelected,
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, highLatitudeRule: rule.key }))}
          >
            <Text style={[
              styles.optionText,
              preferences.highLatitudeRule === rule.key && styles.optionTextSelected,
            ]}>
              {rule.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      {Object.entries(preferences.notifications).map(([prayer, enabled]) => (
        <View key={prayer} style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
          </Text>
          <Switch
            value={enabled}
            onValueChange={() => toggleNotification(prayer as keyof typeof preferences.notifications)}
            trackColor={{ false: '#e5e7eb', true: '#0E7490' }}
            thumbColor={enabled ? '#fff' : '#fff'}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Settings</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={saving}
        >
          <Text style={[styles.headerButtonText, saving && styles.disabledText]}>
            {saving ? '...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderCalculationMethodSelector()}
        {renderHighLatitudeRuleSelector()}
        {renderNotificationSettings()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 18,
    color: '#0E7490',
    fontWeight: '600',
  },
  disabledText: {
    color: '#9ca3af',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#0E7490',
    borderColor: '#0E7490',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
  },
});