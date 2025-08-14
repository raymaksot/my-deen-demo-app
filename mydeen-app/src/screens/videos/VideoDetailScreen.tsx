import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VideoDetailScreen() {
  const navigation = useNavigation<any>();
  const route: any = useRoute();
  const video = route.params?.video;
  const {
    title = 'Video Title',
    author = 'Author',
    thumbnail,
    duration = '15:21',
    category = 'Quran',
  } = video || {};

  // Dummy related videos; reuse sample from list
  const related = [
    {
      id: 'relv1',
      title: 'The Beauty of Islamic Art and Architecture',
      author: 'Sarina Ahmad',
      thumbnail: require('../../../assets/onboarding.png'),
      duration: '15:21',
    },
    {
      id: 'relv2',
      title: 'Islamic Parenting: Nurturing the Next Generation',
      author: 'Unknown',
      thumbnail: require('../../../assets/onboarding.png'),
      duration: '15:21',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.playerContainer}>
        {thumbnail ? (
          <Image source={thumbnail} style={styles.playerImage} />
        ) : (
          <View style={styles.playerImage} />
        )}
        {/* Overlay controls placeholder */}
        <View style={styles.playerControls}>
          <Text style={{ color: '#fff' }}>▶</Text>
        </View>
        <View style={styles.durationOverlay}>
          <Text style={{ color: '#fff', fontSize: 10 }}>{duration}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.videoMeta}>4.4K views   21 Days ago</Text>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: 'https://placekitten.com/100/100' }}
            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{author}</Text>
            <Text style={styles.authorMeta}>218 Videos</Text>
          </View>
          <TouchableOpacity style={styles.visitBtn}><Text style={{ color: '#fff', fontSize: 12 }}>Visit Profile</Text></TouchableOpacity>
        </View>
        {/* Actions row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionIcon}>👍</Text><Text style={styles.actionLabel}>1.8K</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionIcon}>👎</Text><Text style={styles.actionLabel}>21</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionIcon}>↗</Text><Text style={styles.actionLabel}>Share</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionIcon}>↓</Text><Text style={styles.actionLabel}>Download</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionIcon}>🔖</Text></TouchableOpacity>
        </View>
        {/* Related Videos */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Related Video</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {related.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.relatedCard}
              onPress={() => navigation.push('VideoDetail', { video: v })}
            >
              <View style={{ position: 'relative' }}>
                <Image source={v.thumbnail} style={styles.relatedThumb} />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{v.duration}</Text>
                </View>
              </View>
              <Text style={styles.relatedTitle} numberOfLines={2}>{v.title}</Text>
              <Text style={styles.relatedAuthor}>By {v.author}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  playerContainer: { position: 'relative', width: '100%', height: 220, backgroundColor: '#000' },
  playerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  playerControls: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  durationOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  videoTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  videoMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  authorName: { fontSize: 14, fontWeight: '600' },
  authorMeta: { fontSize: 12, color: '#6b7280' },
  visitBtn: { backgroundColor: '#0E7490', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionIcon: { fontSize: 16, marginRight: 4 },
  actionLabel: { fontSize: 12, color: '#374151' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  relatedCard: { width: 200, marginRight: 16 },
  relatedThumb: { width: '100%', height: 120, borderRadius: 16, resizeMode: 'cover' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  durationText: { color: '#fff', fontSize: 10 },
  relatedTitle: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  relatedAuthor: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});