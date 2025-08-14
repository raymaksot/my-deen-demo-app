import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setThemeMode } from '@/store/preferencesSlice';
import { logout } from '@/store/authSlice';

/**
 * ProfileScreen shows the logged‑in user’s information and provides links to
 * account settings such as editing the profile, changing language, selecting
 * location and toggling dark mode.  A logout option is also provided.
 */
export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const prefs = useAppSelector((s) => s.preferences);
  const dispatch = useAppDispatch();

  function toggleTheme() {
    dispatch(setThemeMode(prefs.themeMode === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Hero header */}
      <ImageBackground
        source={require('../../../assets/homepage.png')}
        style={styles.hero}
        resizeMode="cover"
      >
        <Text style={styles.heroTitle}>Profile</Text>
      </ImageBackground>
      {/* User card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../../assets/onboarding.png')}
            style={styles.avatar}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.cardEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editBtn}
        >
          <Text style={{ fontSize: 16 }}>✎</Text>
        </TouchableOpacity>
      </View>
      {/* Account settings */}
      <Text style={styles.sectionHeader}>Account Settings</Text>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('MyEvents')}
      >
        <Text style={styles.listText}>My Events</Text>
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.listText}>Account Preferences</Text>
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('MyLocation')}
      >
        <Text style={styles.listText}>My Location</Text>
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('Language')}
      >
        <Text style={styles.listText}>Language</Text>
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
      <View style={[styles.listItem, { justifyContent: 'space-between' }]}>
        <Text style={styles.listText}>Dark Mode</Text>
        <Switch
          value={prefs.themeMode === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#e5e7eb', true: '#0E7490' }}
          thumbColor="#fff"
        />
      </View>
      {/* Other */}
      <Text style={styles.sectionHeader}>Other</Text>
      <TouchableOpacity style={styles.listItem} onPress={() => { /* TODO: contact support */ }}>
        <Text style={styles.listText}>Contact Support</Text>
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.listItem, { borderColor: 'transparent' }]}
        onPress={() => dispatch(logout())}
      >
        <Text style={[styles.listText, { color: '#DC2626' }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 140, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -40,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  cardName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardEmail: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  editBtn: {
    backgroundColor: '#0E7490',
    padding: 8,
    borderRadius: 20,
  },
  sectionHeader: { marginTop: 24, marginHorizontal: 16, fontSize: 16, fontWeight: '700', color: '#111827' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  listText: { fontSize: 16, color: '#111827' },
  listArrow: { fontSize: 20, color: '#9CA3AF' },
});