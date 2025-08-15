import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { quranService, DailyAyah } from '@/services/quranService';
import { hadithService, Hadith } from '@/services/hadithService';
import { useThemeColors } from '@/theme/theme';

interface DailyContentProps {
  style?: any;
}

export default function DailyContent({ style }: DailyContentProps) {
  const [dailyAyah, setDailyAyah] = useState<DailyAyah | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadDailyContent();
  }, []);

  const loadDailyContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ayah, hadith] = await Promise.all([
        quranService.getDailyAyah(),
        hadithService.getDailyHadith(),
      ]);
      
      setDailyAyah(ayah);
      setDailyHadith(hadith);
    } catch (err: any) {
      setError(err.message || 'Failed to load daily content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Daily Inspiration</Text>
      
      {/* Daily Ayah */}
      {dailyAyah && (
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('dailyAyah')}</Text>
            <Text style={styles.surahInfo}>
              {dailyAyah.surah.englishName} ({dailyAyah.surah.number}:{dailyAyah.number})
            </Text>
          </View>
          <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.arabicText}>{dailyAyah.text}</Text>
            {dailyAyah.translation && (
              <Text style={styles.translationText}>{dailyAyah.translation}</Text>
            )}
            {dailyAyah.tafsir && (
              <Text style={styles.tafsirText}>{dailyAyah.tafsir}</Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Daily Hadith */}
      {dailyHadith && (
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('dailyHadith')}</Text>
            <Text style={styles.surahInfo}>
              {dailyHadith.collection}
              {dailyHadith.bookNumber && ` • Book ${dailyHadith.bookNumber}`}
              {dailyHadith.number && ` • ${dailyHadith.number}`}
            </Text>
          </View>
          <ScrollView style={styles.textContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.arabicText}>{dailyHadith.text}</Text>
            {dailyHadith.translation && (
              <Text style={styles.translationText}>{dailyHadith.translation}</Text>
            )}
            {dailyHadith.narrator && (
              <Text style={styles.narratorText}>— {dailyHadith.narrator}</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    container: {
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      marginHorizontal: 16,
    },
    contentCard: {
      backgroundColor: colors.card || colors.background,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border || (colors.background === '#0B1220' ? '#1F2937' : '#E5E7EB'),
    },
    cardHeader: {
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    surahInfo: {
      fontSize: 12,
      color: colors.textSecondary || colors.text,
      opacity: 0.7,
    },
    textContainer: {
      maxHeight: 120,
    },
    arabicText: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'right',
      lineHeight: 28,
      marginBottom: 12,
      fontFamily: 'System', // Could be replaced with Arabic font
    },
    translationText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    tafsirText: {
      fontSize: 12,
      color: colors.textSecondary || colors.text,
      lineHeight: 18,
      opacity: 0.8,
    },
    narratorText: {
      fontSize: 12,
      color: colors.primary,
      lineHeight: 18,
      fontWeight: '500',
      textAlign: 'right',
    },
    loadingText: {
      color: colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    errorText: {
      color: '#EF4444',
      textAlign: 'center',
      fontSize: 14,
    },
  });