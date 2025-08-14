import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ENV } from '../../config/env';

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'mosque' | 'restaurant';
  address?: string;
  rating?: number;
  isOpen?: boolean;
  distance?: string;
}

export default function FindMosqueScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedType, setSelectedType] = useState<'mosque' | 'restaurant'>('mosque');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to find nearby places.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      setCoords({ lat, lng });
      await fetchPlaces(lat, lng, selectedType);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const fetchPlaces = async (lat: number, lng: number, type: 'mosque' | 'restaurant') => {
    setLoading(true);
    try {
      if (ENV.googleMapsApiKey) {
        const radius = 3000;
        const keyword = type === 'mosque' ? 'mosque' : 'halal restaurant';
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${ENV.googleMapsApiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results) {
          const mappedPlaces: Place[] = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            type,
            address: place.vicinity,
            rating: place.rating,
            isOpen: place.opening_hours?.open_now,
            distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
          }));
          setPlaces(mappedPlaces);
        }
      } else {
        // Fallback to mock data if no API key
        console.warn('No Google Maps API key provided, using mock data');
        setPlaces([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      Alert.alert('Error', 'Failed to fetch nearby places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  const onChangeType = async (type: 'mosque' | 'restaurant') => {
    if (!coords) return;
    setSelectedType(type);
    setSelected(null);
    await fetchPlaces(coords.lat, coords.lng, type);
  };

  const openGoogleMaps = (place: Place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.id}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open Google Maps');
      }
    });
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find {selectedType === 'mosque' ? 'Mosque' : 'Halal Food'}</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={() => coords && fetchPlaces(coords.lat, coords.lng, selectedType)}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggle, selectedType === 'mosque' && styles.toggleActive]} 
          onPress={() => onChangeType('mosque')}
        >
          <Text style={[styles.toggleText, selectedType === 'mosque' && styles.toggleTextActive]}>
            Mosques
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggle, selectedType === 'restaurant' && styles.toggleActive]} 
          onPress={() => onChangeType('restaurant')}
        >
          <Text style={[styles.toggleText, selectedType === 'restaurant' && styles.toggleTextActive]}>
            Halal Food
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map with markers */}
      {coords ? (
        <MapView 
          style={styles.map}
          initialRegion={{
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.lat,
                longitude: place.lng,
              }}
              title={place.name}
              description={place.address}
              onPress={() => setSelected(place)}
              pinColor={place.type === 'mosque' ? '#0E7490' : '#059669'}
            />
          ))}
        </MapView>
      ) : (
        <View style={[styles.map, styles.loadingContainer]}>
          <Text>Loading map...</Text>
        </View>
      )}

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {selected ? (
          // Detail sheet
          <View style={styles.sheet}>
            <View style={styles.placeHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetName}>{selected.name}</Text>
                <Text style={styles.sheetDistance}>{selected.distance}</Text>
                {selected.address && (
                  <Text style={styles.sheetAddress}>{selected.address}</Text>
                )}
                {selected.rating && (
                  <Text style={styles.sheetRating}>⭐ {selected.rating.toFixed(1)}</Text>
                )}
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {selected.isOpen !== undefined 
                    ? (selected.isOpen ? 'Open' : 'Closed')
                    : selected.type === 'mosque' ? 'Mosque' : 'Restaurant'
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => openGoogleMaps(selected)}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Navigate Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // List of nearest places
          <View style={{ paddingTop: 16, paddingBottom: 32 }}>
            <Text style={styles.nearestTitle}>
              Nearest {selectedType === 'mosque' ? 'Mosques' : 'Halal Restaurants'}
              {loading && ' (Loading...)'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
              {places.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.card}
                  onPress={() => setSelected(place)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardBadge}>
                      <Text style={styles.cardBadgeText}>
                        {place.type === 'mosque' ? '🕌' : '🍽️'}
                      </Text>
                    </View>
                    <Text style={styles.cardName} numberOfLines={2}>{place.name}</Text>
                    <Text style={styles.cardDistance}>{place.distance}</Text>
                    {place.rating && (
                      <Text style={styles.cardRating}>⭐ {place.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              {places.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No {selectedType === 'mosque' ? 'mosques' : 'halal restaurants'} found nearby
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  searchBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  toggleContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1000,
  },
  toggle: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#0E7490',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  map: { 
    flex: 1,
    marginTop: 60, // Space for header and toggle
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    maxHeight: '50%',
  },
  sheet: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: { color: '#15803D', fontSize: 12, fontWeight: '600' },
  sheetName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sheetDistance: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  sheetAddress: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  sheetRating: { fontSize: 14, color: '#F59E0B', marginTop: 4, fontWeight: '600' },
  navigateBtn: {
    backgroundColor: '#0E7490',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 8,
  },
  nearestTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  card: {
    width: 180,
    marginRight: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
    height: 120,
  },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: { fontSize: 16 },
  cardName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827', 
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDistance: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  cardRating: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});