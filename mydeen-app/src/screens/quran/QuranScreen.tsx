import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { quranService, Surah } from '@/services/quranService';

/**
 * QuranScreen renders a list of surahs (chapters) in the Qur’an and allows
 * users to search or shuffle the list.  A “continue reading” card is shown at
 * the top, emulating the Figma design provided.  When a surah is tapped it
 * navigates to the SurahDetail screen, passing the full surah object to the
 * route.
 */
export default function QuranScreen() {
  const navigation = useNavigation<any>();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filtered, setFiltered] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setIsOffline(false);
      try {
        const data = await quranService.getSurahs();
        setSurahs(data);
        setFiltered(data);
      } catch (e: any) {
        console.error('Failed to load surahs', e);
        if (e.message.includes('Network unavailable')) {
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter surahs based on search string
  useEffect(() => {
    if (!search) {
      setFiltered(surahs);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        surahs.filter(
          (x) =>
            x.englishName.toLowerCase().includes(s) ||
            (x.name && x.name.toLowerCase().includes(s)) ||
            (x.englishNameTranslation && x.englishNameTranslation.toLowerCase().includes(s))
        ),
      );
    }
  }, [search, surahs]);

  function shuffleList() {
    // Simple shuffle using Fisher–Yates
    const arr = [...filtered];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setFiltered(arr);
  }

  function renderItem({ item }: { item: Surah }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('SurahDetail', { surah: item })}
      >
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{item.number}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.surahName}>{item.englishName}</Text>
          <Text style={styles.surahTranslation}>{item.englishNameTranslation}</Text>
        </View>
        <Text style={styles.arabicName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Al ‑ Quran</Text>
        <View style={styles.headerActions}>
          {isOffline && (
            <TouchableOpacity 
              style={styles.offlineIndicator}
              onPress={async () => {
                setLoading(true);
                setIsOffline(false);
                try {
                  const data = await quranService.getSurahs();
                  setSurahs(data);
                  setFiltered(data);
                } catch (e: any) {
                  if (e.message.includes('Network unavailable')) {
                    setIsOffline(true);
                  }
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.offlineText}>📡 Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Search bar */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search surah or Verse"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      {/* Continue reading card */}
      <TouchableOpacity
        style={styles.continueCard}
        onPress={() => {
          // Hard coded continue reading to Surah 2, ayah 128 for demo
          const surah = surahs.find((s) => s.number === 2);
          if (surah) navigation.navigate('SurahDetail', { surah });
        }}
      >
        <Text style={styles.continueTitle}>Continue reading</Text>
        <Text style={styles.continueSubtitle}>Al Baqarah : 128</Text>
      </TouchableOpacity>
      {/* List header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderText}>Quran Lists</Text>
        <TouchableOpacity onPress={shuffleList}>
          <Text style={styles.shuffleText}>Shuffle</Text>
        </TouchableOpacity>
      </View>
      {/* Surah list */}
      <FlatList
        data={filtered}
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
                No cached surahs available. Please connect to the internet to load Quran data.
              </Text>
            </View>
          ) : (
            <Text style={{ padding: 16 }}>No surah found</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  searchBox: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  searchInput: { fontSize: 14, color: '#111827' },
  continueCard: {
    backgroundColor: '#0E7490',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  continueTitle: { color: '#fff', fontSize: 14, marginBottom: 4 },
  continueSubtitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listHeaderText: { fontSize: 18, fontWeight: '700' },
  shuffleText: { color: '#0E7490', fontSize: 14, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: { color: '#0E7490', fontWeight: '700' },
  surahName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  surahTranslation: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  arabicName: { fontSize: 18, fontWeight: '700', color: '#0E7490' },
  offlineIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
});