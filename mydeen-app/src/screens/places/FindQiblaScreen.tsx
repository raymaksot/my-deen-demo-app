import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QiblaCompass from './QiblaCompass';

export default function FindQiblaScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Qibla</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>📍</Text>
        </TouchableOpacity>
      </View>
      <ImageBackground
        source={require('../../../assets/find_qibla.png')}
        style={styles.image}
        resizeMode="cover"
      >
        {/* Dotted line overlay; simplified as a white dashed line */}
        <View style={styles.arrowLine} />
        <View style={styles.coordBox}>
          <Text style={styles.coordText}>21°53'N 102°18'W</Text>
        </View>
      </ImageBackground>
      {/* Compass */}
      <View style={styles.compassContainer}>
        <QiblaCompass />
      </View>
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
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  image: {
    width: '100%',
    height: 300,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  arrowLine: {
    width: 2,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: '25%',
  },
  coordBox: {
    backgroundColor: '#0E7490',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  coordText: { color: '#fff', fontSize: 12 },
  compassContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});