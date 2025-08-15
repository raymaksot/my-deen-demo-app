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
import { useThemeConfig } from '@/theme/theme';

// Simple representation of an article used for the list.  In a real
// application you would fetch this from your API.
interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  image: any; // require()
  excerpt: string;
  content: string;
}

const sampleArticles: Article[] = [
  {
    id: '1',
    category: 'Historical',
    title: 'The Beauty of Islamic Art and Architecture',
    author: 'Sarina Ahmad',
    image: require('../../../assets/onboarding.png'),
    excerpt:
      'Islamic art and architecture are among the most impressive and visually striking artistic traditions in the world.',
    content:
      'Islamic art and architecture are among the most impressive and visually striking artistic traditions in the world. Spanning centuries and encompassing diverse regions and cultures, Islamic art has left an indelible mark on the world of art and architecture. In this article, we will explore the rich history and cultural significance of Islamic art and architecture, and discover the beauty of this magnificent tradition...'
  },
  {
    id: '2',
    category: 'Historical',
    title: "The World's Muslims: Religion, Politics and Society",
    author: 'Natalia Parsha',
    image: require('../../../assets/onboarding.png'),
    excerpt: 'A comprehensive look at the lives of Muslims around the globe and how faith shapes their societies.',
    content: 'Full content coming soon...'
  },
  {
    id: '3',
    category: 'Historical',
    title: 'Biography of Abdullah bin Umar radhiyallahu \"anhu',
    author: 'Muhammad Faqih',
    image: require('../../../assets/onboarding.png'),
    excerpt: 'Explore the life and times of one of the companions of the Prophet and his contributions to Islamic scholarship.',
    content: 'Full content coming soon...'
  },
  {
    id: '4',
    category: 'Fiqh',
    title: 'Fasting, but Remaining Disobedient',
    author: 'Muhammad Idris',
    image: require('../../../assets/onboarding.png'),
    excerpt: 'An examination of the spiritual dimensions of fasting and why abstaining from food alone is not enough.',
    content: 'Full content coming soon...'
  },
];

const categories = ['Quran', 'Hadith', 'History', 'Creed', 'Manhaj', 'Fiqh'];

export default function ArticlesScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('Quran');
  const { colors, fontMultiplier } = useThemeConfig();
  const styles = React.useMemo(() => createStyles(colors, fontMultiplier), [colors, fontMultiplier]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20 * fontMultiplier, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article</Text>
      </View>
      <View style={styles.searchBox}>
        <Text style={{ color: colors.muted, fontSize: 14 * fontMultiplier }}>Search article title</Text>
      </View>
      {/* Continue Reading */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Continue Reading</Text>
        <TouchableOpacity
          style={styles.continueCard}
          onPress={() => navigation.navigate('ArticleDetail', { article: sampleArticles[0] })}
        >
          <Image source={sampleArticles[0].image} style={styles.continueImage} />
          <View style={{ padding: 8 }}>
            <Text style={styles.categoryLabel}>{sampleArticles[0].category}</Text>
            <Text style={styles.continueTitle}>{sampleArticles[0].title}</Text>
            <Text style={styles.continueAuthor}>By {sampleArticles[0].author}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* Featured Article */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Featured Article</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.tab, selectedCategory === cat && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selectedCategory === cat && styles.tabTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Articles list */}
        <View style={{ gap: 16 }}>
          {sampleArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleRow}
              onPress={() => navigation.navigate('ArticleDetail', { article })}
            >
              <Image source={article.image} style={styles.articleImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.categoryLabel}>{article.category}</Text>
                <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.articleAuthor}>By {article.author}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: { [key: string]: string }, fontMultiplier: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
    backBtn: { padding: 4, marginRight: 8 },
    headerTitle: { fontSize: 20 * fontMultiplier, fontWeight: '600', color: colors.text },
    searchBox: {
      marginTop: 16,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.card,
    },
    sectionTitle: { fontSize: 18 * fontMultiplier, fontWeight: '700', marginBottom: 8, color: colors.text },
    continueCard: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    continueImage: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16, resizeMode: 'cover' },
    continueTitle: { fontSize: 16 * fontMultiplier, fontWeight: '700', marginTop: 4, color: colors.text },
    continueAuthor: { fontSize: 12 * fontMultiplier, color: colors.muted, marginTop: 2 },
    categoryLabel: { fontSize: 12 * fontMultiplier, color: colors.muted, marginBottom: 2 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAll: { color: colors.primary, fontSize: 14 * fontMultiplier, fontWeight: '600' },
    tab: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.card,
      marginRight: 8,
    },
    tabSelected: { backgroundColor: colors.primary + '20' }, // 20% opacity
    tabText: { fontSize: 14 * fontMultiplier, color: colors.muted },
    tabTextSelected: { color: colors.primary, fontWeight: '600' },
    articleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    articleImage: { width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' },
    articleTitle: { fontSize: 16 * fontMultiplier, fontWeight: '600', color: colors.text },
    articleAuthor: { fontSize: 12 * fontMultiplier, color: colors.muted, marginTop: 2 },
  });