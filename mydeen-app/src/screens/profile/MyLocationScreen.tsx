import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/authSlice';
import { authService } from '@/services/authService';

/**
 * MyLocationScreen lets the user pick their current location.  A map
 * placeholder is displayed with a marker.  When the user presses the button,
 * the location is stored on the server and in the user profile.  If
 * geolocation fails, the button will be disabled.
 */
export default function MyLocationScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        try {
          const rev = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (rev && rev[0]) {
            const { street, city, postalCode, region, country } = rev[0];
            setAddress(`${street ?? ''} ${city ?? ''} ${postalCode ?? ''} ${region ?? ''} ${country ?? ''}`.trim());
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSelect() {
    if (!coords) return;
    setSaving(true);
    try {
      const locStr = address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      if (user) {
        const updated = await authService.updateProfile({ location: locStr });
        dispatch(setUser(updated));
      }
      navigation.goBack();
    } catch (e) {
      console.error('Failed to update location', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Location</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>
      <ImageBackground
        source={require('../../../assets/my_location.png')}
        style={styles.map}
        resizeMode="cover"
      >
        {/* Marker overlay */}
        <View style={styles.markerWrapper}>
          <View style={styles.marker} />
          <View style={styles.markerRing} />
        </View>
      </ImageBackground>
      <View style={styles.bottomCard}>
        <Text style={styles.cardTitle}>Current Location</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0E7490" />
        ) : (
          <Text style={styles.cardAddress}>{address || (coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Unknown')}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: !coords || saving ? '#9CA3AF' : '#0E7490' }]}
        onPress={handleSelect}
        disabled={!coords || saving}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Saving…' : 'Select Location'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  map: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  markerWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0E7490',
  },
  markerRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bottomCard: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardAddress: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  selectBtn: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
});