import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setPrayerPreferences } from '../store/preferencesSlice';
import {
  PrayerPreferences,
  CalculationMethodOptions,
  MadhabOptions,
  LatitudeAdjustmentMethodOptions,
  PrayerKey,
} from '../prayer/prayerTypes';
import { schedulePrayerNotifications } from '../notifications/usePrayerNotifications';
import { appStorage } from '../utils/storage';
import { computePrayerTimes } from '../prayer/prayerTimes';

const prayerNames: { key: PrayerKey; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

export default function PrayerSettingsScreen() {
  const dispatch = useDispatch();
  const currentPrefs = useSelector((state: RootState) => state.preferences.prayer);
  const [localPrefs, setLocalPrefs] = useState<PrayerPreferences>(currentPrefs);
  const [isLoading, setSaving] = useState(false);

  useEffect(() => {
    setLocalPrefs(currentPrefs);
  }, [currentPrefs]);

  const updatePreference = <K extends keyof PrayerPreferences>(
    key: K,
    value: PrayerPreferences[K]
  ) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationPreference = (prayer: PrayerKey, enabled: boolean) => {
    setLocalPrefs(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [prayer]: enabled,
      },
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Update the store
      dispatch(setPrayerPreferences(localPrefs));

      // Get coordinates and reschedule notifications
      const coords = await appStorage.getObject<{ latitude: number; longitude: number }>('prefs:coords');
      if (coords) {
        const today = new Date();
        const times = computePrayerTimes(today, coords, localPrefs);
        await schedulePrayerNotifications(localPrefs, times);
      }

      Alert.alert('Success', 'Prayer settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save prayer settings. Please try again.');
      console.error('Error saving prayer settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderCalculationMethodPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Calculation Method</Text>
      {CalculationMethodOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionRow,
            localPrefs.calculationMethod === option.key && styles.selectedOption,
          ]}
          onPress={() => updatePreference('calculationMethod', option.key)}
        >
          <Text
            style={[
              styles.optionText,
              localPrefs.calculationMethod === option.key && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMadhabPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Madhab</Text>
      {MadhabOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionRow,
            localPrefs.madhab === option.key && styles.selectedOption,
          ]}
          onPress={() => updatePreference('madhab', option.key)}
        >
          <Text
            style={[
              styles.optionText,
              localPrefs.madhab === option.key && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLatitudeAdjustmentPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>High Latitude Rule</Text>
      {LatitudeAdjustmentMethodOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionRow,
            localPrefs.latitudeAdjustmentMethod === option.key && styles.selectedOption,
          ]}
          onPress={() => updatePreference('latitudeAdjustmentMethod', option.key)}
        >
          <Text
            style={[
              styles.optionText,
              localPrefs.latitudeAdjustmentMethod === option.key && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNotificationToggles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prayer Notifications</Text>
      {prayerNames.map((prayer) => (
        <View key={prayer.key} style={styles.notificationRow}>
          <Text style={styles.prayerLabel}>{prayer.label}</Text>
          <Switch
            value={localPrefs.notifications?.[prayer.key] ?? true}
            onValueChange={(value) => updateNotificationPreference(prayer.key, value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={localPrefs.notifications?.[prayer.key] ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prayer Settings</Text>
      
      {renderCalculationMethodPicker()}
      {renderMadhabPicker()}
      {renderLatitudeAdjustmentPicker()}
      {renderNotificationToggles()}

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={savePreferences}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    color: '#333',
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  prayerLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});