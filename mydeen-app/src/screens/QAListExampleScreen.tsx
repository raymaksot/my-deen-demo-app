import * as React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { qaService, QAItem } from '@/services/qaService';
import { CacheIndicator } from '@/components/CacheIndicator';

interface QAListScreenProps {
  navigation: any;
}

export const QAListScreen: React.FC<QAListScreenProps> = ({ navigation }) => {
  const { isConnected } = useNetworkStatus();
  const [qaResult, setQaResult] = React.useState<{
    data: QAItem[];
    total: number;
    isFromCache: boolean;
    isStale?: boolean;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadQAData = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await qaService.list(1, 20, isConnected);
      setQaResult({
        data: result.data.data,
        total: result.data.total,
        isFromCache: result.isFromCache,
        isStale: result.isStale
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isConnected]);

  React.useEffect(() => {
    loadQAData();
  }, [loadQAData]);

  const renderQAItem = ({ item }: { item: QAItem }) => (
    <View style={styles.qaItem}>
      <Text style={styles.qaTitle}>{item.title}</Text>
      <Text style={styles.qaQuestion} numberOfLines={2}>
        {item.question}
      </Text>
      {item.answer && (
        <Text style={styles.qaAnswer} numberOfLines={1}>
          Ответ: {item.answer}
        </Text>
      )}
      <Text style={styles.qaDate}>
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
      </Text>
    </View>
  );

  if (loading && !qaResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка вопросов...</Text>
      </View>
    );
  }

  if (error && !qaResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        {!isConnected && (
          <Text style={styles.offlineText}>
            Устройство не подключено к интернету
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CacheIndicator
        isFromCache={qaResult?.isFromCache || false}
        isStale={qaResult?.isStale}
        style={styles.cacheIndicator}
      />
      
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Режим оффлайн</Text>
        </View>
      )}

      <FlatList
        data={qaResult?.data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderQAItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadQAData(true)}
            enabled={isConnected}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет доступных вопросов</Text>
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
  offlineBanner: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qaItem: {
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
  qaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  qaQuestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  qaAnswer: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  qaDate: {
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