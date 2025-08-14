import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Mosque {
  id: string;
  name: string;
  distance: string;
  status: 'open' | 'closed';
  image: any;
  top: number;
  left: number;
}

// A handful of sample mosques with approximate screen positions.  The top/left
// values determine where the marker appears on the map image.  In a real app
// these would be calculated from latitude/longitude relative to the map region.
const mosques: Mosque[] = [
  {
    id: 'm1',
    name: 'Baitul Mustaqin Mosque',
    distance: '736 m',
    status: 'open',
    image: require('../../../assets/find_mosque_detail.png'),
    top: 180,
    left: 80,
  },
  {
    id: 'm2',
    name: 'Darius Mosque',
    distance: '1.2 km',
    status: 'open',
    image: require('../../../assets/find_mosque_detail.png'),
    top: 220,
    left: 220,
  },
  {
    id: 'm3',
    name: 'Masjid Al‑Hidayah',
    distance: '2.5 km',
    status: 'closed',
    image: require('../../../assets/find_mosque_detail.png'),
    top: 260,
    left: 140,
  },
];

export default function FindMosqueScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<Mosque | null>(null);
  return (
    <View style={styles.container}>
      {/* Map with markers */}
      <ImageBackground
        source={require('../../../assets/find_mosque.png')}
        style={styles.map}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Mosque</Text>
          <TouchableOpacity style={styles.searchBtn}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
        </View>
        {/* Markers on the map */}
        {mosques.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => setSelected(m)}
            style={[styles.marker, { top: m.top, left: m.left }]}
          >
            <View style={styles.markerCircle} />
          </TouchableOpacity>
        ))}
      </ImageBackground>
      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {selected ? (
          // Detail sheet
          <View style={styles.sheet}>
            <Image source={selected.image} style={styles.sheetImage} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View>
                <Text style={styles.sheetName}>{selected.name}</Text>
                <Text style={styles.sheetDistance}>{selected.distance}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selected.status === 'open' ? 'Open' : 'Closed'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => {
                // In a real app this would open external navigation
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Navigate Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // List of nearest mosques
          <View style={{ paddingTop: 16, paddingBottom: 32 }}>
            <Text style={styles.nearestTitle}>Nearest Mosque</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {mosques.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.card}
                  onPress={() => setSelected(m)}
                >
                  <Image source={m.image} style={styles.cardImage} />
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>Open</Text>
                  </View>
                  <Text style={styles.cardName}>{m.name}</Text>
                  <Text style={styles.cardDistance}>{m.distance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  headerRow: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyBetween: 'space-between',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  searchBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  marker: { position: 'absolute' },
  markerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0E7490',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 16,
  },
  sheet: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  sheetImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  badge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#15803D', fontSize: 12, fontWeight: '600' },
  sheetName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sheetDistance: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  navigateBtn: {
    backgroundColor: '#0E7490',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 16,
  },
  nearestTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  card: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  cardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: { color: '#15803D', fontSize: 10, fontWeight: '600' },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8, marginHorizontal: 8 },
  cardDistance: { fontSize: 12, color: '#6B7280', marginTop: 2, marginHorizontal: 8 },
});