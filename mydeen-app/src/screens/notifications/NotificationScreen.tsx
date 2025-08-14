import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useThemeColors } from '@/theme/theme';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji placeholder
  link?: string;
}

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Now is Dhuhr Time!',
    description: 'Find a clean and quiet place to pray, facing towards the Qiblah.',
    icon: '☀️',
    link: 'Locate Qiblah',
  },
  {
    id: 'n2',
    title: 'Tomorrow is Ramadhan',
    description: 'Ramadan is coming, prepare your self to be better in this year.',
    icon: '🌙',
  },
  {
    id: 'n3',
    title: 'Subscription Renewal',
    description: 'You have make a renewal subscription, you can see the receipt in your e-wallet app.',
    icon: '💳',
  },
  {
    id: 'n4',
    title: 'Now is Asr Time',
    description: 'Find a clean and quiet place to pray, facing towards the Qiblah.',
    icon: '🌅',
  },
];

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity onPress={() => {}} style={styles.settingsBtn}>
          <Text style={{ fontSize: 20, color: colors.text }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionLabel}>Today</Text>
      {notifications.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            {item.link && <Text style={styles.cardLink}>{item.link}</Text>}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// Build a dynamic style sheet based on the current theme colours.  Cards
// and background colours adjust automatically when switching modes.
const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    backBtn: { padding: 4 },
    settingsBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
    sectionLabel: { fontSize: 14, color: colors.muted, marginBottom: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.background === '#0B1220' ? '#1F2937' : '#f9fafb',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background === '#0B1220' ? '#374151' : '#e5e7eb',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    cardDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
    cardLink: { fontSize: 12, color: colors.primary, marginTop: 4 },
  });