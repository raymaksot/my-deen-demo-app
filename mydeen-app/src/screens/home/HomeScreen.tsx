import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { prayerService, PrayerTimesResponse } from '@/services/prayerService';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { schedulePrayerNotifications, scheduleDailyContentNotification } from '@/services/athan';
import { useThemeColors } from '@/theme/theme';
import DailyContent from '@/components/DailyContent';

export default function HomeScreen() {
	const navigation = useNavigation<any>();
	const { t } = useTranslation();
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
	const [times, setTimes] = useState<PrayerTimesResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const calcMethod = useAppSelector((s) => s.preferences.prayer.calculationMethod);
	const [syncing, setSyncing] = useState(false);

	// Pull colours from theme.  We'll build styles from these colours.
	const colors = useThemeColors();
	const styles = React.useMemo(() => createStyles(colors), [colors]);

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setError(t('locationPermissionDenied'));
				return;
			}
			const loc = await Location.getCurrentPositionAsync({});
			const lat = loc.coords.latitude;
			const lng = loc.coords.longitude;
			setCoords({ lat, lng });
			try {
				const res = await prayerService.getTodayTimes(lat, lng, calcMethod);
				setTimes(res);
				await schedulePrayerNotifications(res);
				await scheduleDailyContentNotification();
			} catch (e: any) {
				setError(e.message);
			}
		})();
	}, [calcMethod]);

    // Sample content for featured cult and latest articles. In a real app these would come from API
    const videos = [
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
    ];
    const articles = [
        {
            id: 'a1',
            category: 'Historical',
            title: 'The World’s Muslims: Religion, Politics and Society',
            author: 'Natalia Parsha',
            image: require('../../../assets/onboarding.png'),
        },
        {
            id: 'a2',
            category: 'Historical',
            title: 'Biography of Abdullah bin Umar radhiyallahu \"anhu',
            author: 'Muhammad Faqih',
            image: require('../../../assets/onboarding.png'),
        },
        {
            id: 'a3',
            category: 'Fiqh',
            title: 'Fasting, but Remaining Disobedient',
            author: 'Muhammad Idris',
            image: require('../../../assets/onboarding.png'),
        },
    ];

    const mosquesList = [
        { id: 'm1', name: 'Baitul Mustaqin Mosque', distance: '736 M', image: require('../../../assets/onboarding.png') },
        { id: 'm2', name: 'Darius Mosque', distance: '1,2 Km', image: require('../../../assets/onboarding.png') },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Hero / greeting */}
            <ImageBackground
                // Use a generic background for hero.  In a real app you would swap
                // this image for a light or dark variant.  For demonstration we
                // reuse onboarding.png, but you could import a dark‑specific file.
                source={colors.background === '#0B1220' ? require('../../../assets/homepage_dark.png') : require('../../../assets/homepage.png')}
                style={styles.hero}
                resizeMode="cover"
            >
                <View style={styles.heroOverlay} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 14 }}>{t('assalamuAlaikum')}</Text>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>Fatimah Jaber</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                        <Text style={{ color: '#fff', fontSize: 20 }}>🔔</Text>
                    </TouchableOpacity>
                </View>
                {/* Next prayer card */}
                <View style={styles.nextPrayerCard}>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 12 }}>{t('nextPrayerIs')} {t('dhuhr')}</Text>
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{times ? times.dhuhr : '--:--'} {times ? (new Date().getHours() >= 12 ? 'PM' : 'AM') : ''}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('FindQibla')}
                        style={styles.findQiblaBtn}
                    >
                        <Text style={{ color: colors.background === '#0B1220' ? '#fff' : '#0E7490', fontSize: 12, fontWeight: '600' }}>{t('findQibla')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            {/* Daily Content Section */}
            <DailyContent />

            {/* Featured Content Section */}
            <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>{t('featuredContent')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Videos')}><Text style={styles.seeAll}>{t('seeAll')}</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {videos.map((v) => (
                        <TouchableOpacity
                            key={v.id}
                            style={{ width: 200, marginRight: 16 }}
                            onPress={() => navigation.navigate('VideoDetail', { video: v })}
                        >
                            <View style={{ position: 'relative' }}>
                                <Image source={v.thumbnail} style={{ width: '100%', height: 120, borderRadius: 16, resizeMode: 'cover' }} />
                                <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ color: '#fff', fontSize: 10 }}>{v.duration}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 8 }}>{v.title}</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>By {v.author}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Latest Articles Section */}
            <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>{t('latestArticles')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Articles')}><Text style={styles.seeAll}>{t('seeAll')}</Text></TouchableOpacity>
                </View>
                {articles.map((a) => (
                    <TouchableOpacity
                        key={a.id}
                        style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}
                        onPress={() => navigation.navigate('ArticleDetail', { article: a })}
                    >
                        <Image source={a.image} style={{ width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' }} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.categoryLabel}>{a.category}</Text>
                            <Text style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={2}>{a.title}</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>By {a.author}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Nearest Mosque Section */}
            <View style={{ paddingHorizontal: 16, marginTop: 32, marginBottom: 24 }}>
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>{t('nearestMosque')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('FindMosque')}><Text style={styles.seeAll}>{t('seeAll')}</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {mosquesList.map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            style={{ width: 200, marginRight: 16 }}
                            onPress={() => navigation.navigate('FindMosque')}
                        >
                            <Image source={m.image} style={{ width: '100%', height: 120, borderRadius: 16, resizeMode: 'cover' }} />
                            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 8 }}>{m.name}</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{m.distance}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </ScrollView>
    );
}

// Factory to create dynamic styles for the home screen. Colours are
// derived from the active theme.  Various UI elements such as the
// hero overlay, prayer card and button backgrounds change when
// switching between light and dark modes.
const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: {
      height: 260,
      justifyContent: 'flex-end',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background === '#0B1220' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
    },
    nextPrayerCard: {
      backgroundColor:
        colors.background === '#0B1220' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    findQiblaBtn: {
      backgroundColor: colors.background === '#0B1220' ? colors.primary : '#fff',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    seeAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    categoryLabel: { fontSize: 12, color: colors.primary, marginBottom: 2 },
  });