import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { prayerService, PrayerTimesResponse } from '@/services/prayerService';
import { useAppSelector } from '@/store/hooks';
import { useNavigation } from '@react-navigation/native';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function PrayerTimesScreen() {
  const [data, setData] = useState<PrayerTimesResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notifications, setNotifications] = useState({ fajr: true, dhuhr: false, asr: true, maghrib: true, isha: false });
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate() - 1);
  const calcMethod = useAppSelector((s) => s.preferences.prayer.calculationMethod);
  const navigation = useNavigation<any>();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const res = await prayerService.getMonthTimes(
          loc.coords.latitude,
          loc.coords.longitude,
          month + 1,
          year,
          calcMethod
        );
        setData(res);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [month, year, calcMethod]);

  const today = new Date().getDate();

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Time</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      {/* Month selector (simple) */}
      <TouchableOpacity style={styles.monthPicker}>
        <Text>{monthNames[month]}, {year}</Text>
      </TouchableOpacity>
      {/* Calendar grid - simplified: show only header row of days; full calendar omitted */}
      <View style={styles.calendarGrid}>
        {/* Render simple row of numbers for demonstration */}
        {data.map((item, index) => (
          <TouchableOpacity
            key={item.date}
            onPress={() => setSelectedDay(index)}
            style={[styles.dayCell, index === selectedDay && styles.dayCellSelected]}
          >
            <Text style={index === selectedDay ? styles.dayTextSelected : styles.dayText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Daily Shalat list */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Daily Shalat Lists</Text>
      <ScrollView style={{ flex: 1 }}>
        {data[selectedDay] && (
          ['fajr','dhuhr','asr','maghrib','isha'].map((key) => (
            <View key={key} style={styles.prayerRow}>
              <Text style={styles.prayerName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.prayerTime}>{(data[selectedDay] as any)[key]}</Text>
            </View>
          ))
        )}
      </ScrollView>
      {/* Settings modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.modalHandle} />
            </View>
            <Text style={styles.modalTitle}>Prayer Settings</Text>
            <Text style={styles.modalLabel}>Salat Period</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text>January - December, {year}</Text>
            </TouchableOpacity>
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Notification</Text>
            {(['fajr','dhuhr','asr','maghrib','isha'] as (keyof typeof notifications)[]).map((key) => (
              <View key={key} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Switch
                  value={notifications[key]}
                  onValueChange={() => toggleNotification(key)}
                  trackColor={{ false: '#e5e7eb', true: '#0E7490' }}
                  thumbColor={notifications[key] ? '#fff' : '#fff'}
                />
              </View>
            ))}
            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  monthPicker: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    alignSelf: 'flex-start',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    borderRadius: 20,
    backgroundColor: '#0E7490',
  },
  dayText: { color: '#374151' },
  dayTextSelected: { color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  prayerRowSelected: {
    backgroundColor: '#ecfdf5',
  },
  prayerName: { fontSize: 14, fontWeight: '600' },
  prayerTime: { fontSize: 14, color: '#6b7280' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  toggleLabel: { fontSize: 14 },
  closeBtn: {
    backgroundColor: '#0E7490',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
});