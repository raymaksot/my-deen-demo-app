import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Video {
  id: string;
  title: string;
  category: string;
  author: string;
  thumbnail: any;
  duration: string;
}

const videos: Video[] = [
  {
    id: 'v1',
    title: 'Summary of During Ramadan Fasting Fiqh',
    category: 'Quran',
    author: 'Sarina Ahmad',
    thumbnail: require('../../../assets/onboarding.png'),
    duration: '15:21',
  },
  {
    id: 'v2',
    title: 'Q&A with Shaykh Abbad',
    category: 'Hadith',
    author: 'Muhammad Abbad',
    thumbnail: require('../../../assets/onboarding.png'),
    duration: '15:21',
  },
  {
    id: 'v3',
    title: 'The Beauty of Islamic Art and Architecture',
    category: 'History',
    author: 'Sarina Ahmad',
    thumbnail: require('../../../assets/onboarding.png'),
    duration: '15:21',
  },
  {
    id: 'v4',
    title: 'Islamic Parenting: Nurturing the Next Generation',
    category: 'Fiqh',
    author: 'Unknown',
    thumbnail: require('../../../assets/onboarding.png'),
    duration: '15:21',
  },
];

const categories = ['Quran', 'Hadith', 'History', 'Creed', 'Manhaj', 'Fiqh'];

export default function VideosScreen() {
  const navigation = useNavigation<any>();
  const [selectedCat, setSelectedCat] = useState('Quran');
  const featured = videos.filter((v) => v.category === selectedCat);
  const recent = videos;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cult Videos</Text>
      </View>
      <View style={styles.searchBox}>
        <Text style={{ color: '#9ca3af' }}>Search surah or Verse</Text>
      </View>
      {/* Featured */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Featured Cult</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCat(cat)}
              style={[styles.tab, selectedCat === cat && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selectedCat === cat && styles.tabTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featured.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.videoCard}
              onPress={() => navigation.navigate('VideoDetail', { video: v })}
            >
              <View style={{ position: 'relative' }}>
                <Image source={v.thumbnail} style={styles.videoThumbnail} />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{v.duration}</Text>
                </View>
              </View>
              <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
              <Text style={styles.videoAuthor}>By {v.author}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Recently Viewed */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        {recent.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={styles.recentRow}
            onPress={() => navigation.navigate('VideoDetail', { video: v })}
          >
            <View style={{ position: 'relative' }}>
              <Image source={v.thumbnail} style={styles.recentThumb} />
              <View style={styles.durationBadgeSmall}>
                <Text style={styles.durationTextSmall}>{v.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.videoTitle}>{v.title}</Text>
              <Text style={styles.videoAuthor}>By {v.author}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  searchBox: {
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { color: '#0E7490', fontSize: 14, fontWeight: '600' },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginRight: 8,
  },
  tabSelected: { backgroundColor: '#d1fae5' },
  tabText: { fontSize: 14, color: '#6b7280' },
  tabTextSelected: { color: '#0E7490', fontWeight: '600' },
  videoCard: {
    width: 200,
    marginRight: 16,
  },
  videoThumbnail: { width: '100%', height: 120, borderRadius: 16, resizeMode: 'cover' },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: { color: '#fff', fontSize: 10 },
  videoTitle: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  videoAuthor: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recentThumb: { width: 100, height: 70, borderRadius: 12, resizeMode: 'cover' },
  durationBadgeSmall: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationTextSmall: { color: '#fff', fontSize: 9 },
});