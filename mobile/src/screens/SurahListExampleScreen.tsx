import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { getSurahListWithCache, SurahSummary } from '../services/quranService';
import { CacheIndicator } from '../components/CacheIndicator';
import { CacheResult } from '../utils/cache';

export const SurahListScreen: React.FC = () => {
  const [surahResult, setSurahResult] = useState<CacheResult<SurahSummary[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSurahs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await getSurahListWithCache();
      setSurahResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      console.error('Failed to load surahs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  const renderSurah = ({ item }: { item: SurahSummary }) => (
    <View style={styles.surahItem}>
      <View style={styles.surahHeader}>
        <Text style={styles.surahNumber}>{item.number}</Text>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahEnglishName}>{item.englishName}</Text>
          {item.englishNameTranslation && (
            <Text style={styles.surahTranslation}>{item.englishNameTranslation}</Text>
          )}
        </View>
        <Text style={styles.ayahCount}>{item.numberOfAyahs} аятов</Text>
      </View>
    </View>
  );

  if (loading && !surahResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка сур...</Text>
      </View>
    );
  }

  if (error && !surahResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CacheIndicator
        isFromCache={surahResult?.isFromCache || false}
        isStale={surahResult?.isStale}
        style={styles.cacheIndicator}
      />

      <FlatList
        data={surahResult?.data || []}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderSurah}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSurahs(true)}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет доступных сур</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  cacheIndicator: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  surahItem: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  surahEnglishName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  ayahCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#ff6b6b',
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});