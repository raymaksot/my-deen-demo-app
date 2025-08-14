import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CommentsThread } from '@/components/CommentsThread';

export default function ArticleDetailScreen() {
  const route: any = useRoute();
  const navigation = useNavigation<any>();
  const article = route.params?.article;
  // Fallback if opened without params
  const {
    title = 'Article Title',
    category = 'Category',
    author = 'Author',
    image,
    content = 'Content coming soon…',
  } = article || {};

  // Hard-coded related articles; in a real app this would come from API
  const related = [
    {
      id: 'rel1',
      title: 'The World’s Muslims: Religion, Politics and Society',
      author: 'Natalia Parsha',
      category: 'Historical',
      image: require('../../../assets/onboarding.png'),
    },
    {
      id: 'rel2',
      title: 'Biography of Abdullah bin Umar radhiyallahu \"anhu',
      author: 'Muhammad Faqih',
      category: 'Historical',
      image: require('../../../assets/onboarding.png'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryLabel}>{category}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {image && <Image source={image} style={styles.coverImage} />}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: 'https://placekitten.com/100/100' }}
            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
          />
          <Text style={styles.authorName}>{author}</Text>
        </View>
        {/* Article body */}
        <Text style={styles.bodyText}>{content}</Text>
        {/* Related Articles */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Related Article</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {related.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.relatedCard}
              onPress={() => navigation.push('ArticleDetail', { article: item })}
            >
              <Image source={item.image} style={styles.relatedImage} />
              <View style={{ padding: 8 }}>
                <Text style={styles.categoryLabel}>{item.category}</Text>
                <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.relatedAuthor}>By {item.author}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Comments section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Comments</Text>
        <CommentsThread
          parentType="article"
          parentId={article?.id || 'unknown'}
          canEdit={(comment) => true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
  backBtn: { padding: 4, marginRight: 8 },
  categoryLabel: { fontSize: 12, color: '#10b981', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', flexShrink: 1 },
  coverImage: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 0, marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  authorName: { fontSize: 14, fontWeight: '500' },
  bodyText: { fontSize: 14, lineHeight: 22, color: '#374151' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  relatedCard: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  relatedImage: { width: '100%', height: 120, resizeMode: 'cover' },
  relatedTitle: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  relatedAuthor: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});