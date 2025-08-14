import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { quranService, Ayah, Surah } from '@/services/quranService';

/**
 * SurahDetailScreen displays the verses of a surah with Arabic text,
 * translations and basic interaction icons.  Users can tap the translation
 * icon to open a bottom sheet with additional information.  Audio playback
 * is not implemented but icons are provided as placeholders.
 */
export default function SurahDetailScreen() {
  const route = useRoute<any>() as RouteProp<any>;
  const navigation = useNavigation<any>();
  const surah = (route.params?.surah || {}) as Surah;
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      try {
        const data = await quranService.getSurahAyahs(surah.number);
        setAyahs(data);
      } catch (e: any) {
        setError(e.message);
        if (e.message.includes('Network unavailable')) {
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [surah?.number]);

  function openDetail(ayah: Ayah) {
    setSelectedAyah(ayah);
    setShowDetail(true);
  }

  function renderItem({ item }: { item: Ayah }) {
    return (
      <View style={styles.ayahRow}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{item.number}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.arabic}>{item.text}</Text>
          {item.translation && <Text style={styles.translation}>{item.translation}</Text>}
        </View>
        {/* Action icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { /* TODO: audio playback */ }}>
            <Text style={styles.iconText}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { /* TODO: favourite */ }}>
            <Text style={styles.iconText}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => openDetail(item)}>
            <Text style={styles.iconText}>📖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { /* TODO: share */ }}>
            <Text style={styles.iconText}>🔗</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{surah.englishName} - {surah.name}</Text>
        <TouchableOpacity style={{ padding: 4 }} onPress={() => {
          if (isOffline) {
            // Retry loading ayahs
            (async () => {
              setLoading(true);
              setError(null);
              setIsOffline(false);
              try {
                const data = await quranService.getSurahAyahs(surah.number);
                setAyahs(data);
              } catch (e: any) {
                setError(e.message);
                if (e.message.includes('Network unavailable')) {
                  setIsOffline(true);
                }
              } finally {
                setLoading(false);
              }
            })();
          }
        }}>
          <Text style={{ fontSize: 20 }}>{isOffline ? '📡' : '⚙️'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={ayahs}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          loading ? (
            <Text style={{ padding: 16 }}>Loading…</Text>
          ) : isOffline ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 8 }}>
                You're offline
              </Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
                No cached ayahs available for this surah. Please connect to the internet to load the verses.
              </Text>
            </View>
          ) : (
            <Text style={{ padding: 16 }}>{error || 'No data'}</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      {/* Translation detail modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.modalHandle} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>{surah.englishName}</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={{ fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Verses {selectedAyah?.number}</Text>
            <ScrollView style={{ marginTop: 12 }}>
              <Text style={styles.modalBody}>{selectedAyah?.tafsir || selectedAyah?.translation || ''}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', color: '#111827' },
  ayahRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  numberText: { color: '#0E7490', fontWeight: '700' },
  arabic: { fontSize: 20, textAlign: 'right', color: '#111827' },
  translation: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBtn: { paddingHorizontal: 4 },
  iconText: { fontSize: 18 },
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
    maxHeight: '80%',
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  modalBody: { fontSize: 14, color: '#374151', lineHeight: 22 },
});